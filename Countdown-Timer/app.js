window.onload = () => {
    const countdownTimer = document.querySelector('.countdown-timer');
    addCountdownTimer(countdownTimer);
    // countdownTimer.textContent = '00:00:00';

    const numpad = document.querySelector('.numpad');
    addNumpadButtons(numpad);
    numpad.addEventListener('click', onNumpad);

    addControlButtons();

    const setBtn = document.querySelector('#setBtn');
    setBtn.addEventListener('click', onSet);

    const clearBtn = document.querySelector('#clearBtn');
    clearBtn.addEventListener('click', onClear);

    const backBtn = document.querySelector('#backBtn');
    backBtn.addEventListener('click', onBack);

    const startBtn = document.querySelector('#startBtn');
    startBtn.addEventListener('click', onStart);

    const clearBtn2 = document.querySelector('#clearBtn2');
    clearBtn2.addEventListener('click', onClear2);

    const pauseBtn = document.querySelector('#pauseBtn');
    pauseBtn.addEventListener('click', onPause);

    const continueBtn = document.querySelector('#continueBtn');
    continueBtn.addEventListener('click', onContinue);
}

function addCountdownTimer(countdownTimer) {
    const mainTimer = document.createElement('div');
    mainTimer.classList.add('main-timer');
    

    const msTimer = document.createElement('div');
    msTimer.classList.add('ms-timer');
    msTimer.textContent = '000';

    // set main timer
    const timerData = ['hours', ':', 'minutes', ':', 'seconds'];
    for (let i = 0; i < timerData.length; i++) {
        let currDiv = document.createElement('div');

        if (i % 2 == 0) {
            currDiv.classList.add(timerData[i]);
            currDiv.textContent = '00';
        } else {
            currDiv.classList.add('colon');
            currDiv.textContent = timerData[i];
        }
        mainTimer.appendChild(currDiv);
    }
    mainTimer.appendChild(msTimer);

    countdownTimer.appendChild(mainTimer);
    // countdownTimer.appendChild(msTimer);
}

function addNumpadButtons(numpad) {
    for (let i = 0; i < 10; i++) {
        let btn = document.createElement('div');
        btn.innerText = i;
        btn.classList.add('numpad-button');
        btn.id = i;
        numpad.appendChild(btn);
    }
}

function onNumpad(event) {
    event.preventDefault();

    const clicked = event.target;

    // pressedNumbers.count < 6 because there are 3 two digit numbers
    // and we don't need changes after that
    if (clicked.tagName == 'DIV' && clicked.className == 'numpad-button' && pressedNumbers.count < 6) {
        // move numbers to the left
        pressedNumbers.data.push(Number(clicked.textContent));
        pressedNumbers.data.shift();
        pressedNumbers.count += 1;
    }
    updateTimer();
}

const pressedNumbers = {
    count: 0,
    data: [0, 0, 0, 0, 0, 0]
};

// invoking new object from function
//  invoking timeElements object as a function to avoid declaring before they are even not created as an elements
function getTimeElements() {
    return {
        hours: document.querySelector('.hours'),
        minutes: document.querySelector('.minutes'),
        seconds : document.querySelector('.seconds'),
        milliseconds: document.querySelector('.ms-timer')
    };
}

function updateTimer() {
    const timeElements = getTimeElements();
    
    const arr = pressedNumbers.data;
    for (let i = 0; i < arr.length - 1; i++) {
        timeElements.hours.textContent = arr[0] + '' + arr[1];
        timeElements.minutes.textContent = arr[2] + '' + arr[3];
        timeElements.seconds.textContent = arr[4] + '' + arr[5];
    }
}

function getCurrTimeMs() {
    const dt = new Date();
    return dt.getTime();
}

function getCountdownTime() {
    const timeElements = getTimeElements();

    return {
        hours: Number(timeElements.hours.textContent),
        minutes: Number(timeElements.minutes.textContent),
        seconds: Number(timeElements.seconds.textContent),
        milliseconds: Number(timeElements.milliseconds.textContent)
    }
}

function updateCountdownTime(h, m, sec, ms) {
    const timeElements = getTimeElements();
    
    timeElements.hours.textContent = formatTimeElem(h);
    timeElements.minutes.textContent = formatTimeElem(m);
    timeElements.seconds.textContent = formatTimeElem(sec);
    timeElements.milliseconds.textContent = formatMs(ms);
}

function formatMs(ms) {
    if (ms < 10) {
        ms = '00' + ms;
    } else if (ms < 100) {
        ms = '0' + ms;
    }

    return ms;
}

function formatTimeElem(el) {
    if (el < 10) {
        el = '0' + el;
    } 

    return el;
}

function fromTimeToMs(h, min, sec, ms) {
    let milliseconds = ms;
    milliseconds += sec * 1000;
    milliseconds += min * 60 * 1000;
    milliseconds += h * 60 * 60 * 1000;
    return milliseconds;
}

function fromMsToTime(ms) {
    return {
        hours: Math.floor(ms / 1000 / 60 / 60),
        minutes: Math.floor(ms / 1000 / 60) % 60,
        seconds: Math.floor(ms / 1000) % 60,
        milliseconds: ms % 1000
    }
}


const countdown = {
    intervalId: 0,
    msInterval: 0,
    timeLeft: 0,
    pausedTime: 0,
    msLeft: 999,
    pausedMs: 0
};

function onSet() {
    const timeVal = Object.values(getCountdownTime());
    countdown.targetTimeMs = fromTimeToMs(...timeVal);

    if (countdown.targetTimeMs === 0) {
        countdown.targetTimeMs = 10000;
    }

    countdown.timeLeft = countdown.targetTimeMs;
    updateCountdownTime(...Object.values(fromMsToTime(countdown.timeLeft)));
    showHideControls();
    showStartButton();
}

function onStart() {
    startBtn.classList.add('hide');
    pauseBtn.classList.remove('hide');

    countdown.intervalId = setTimeInterval();
    countdown.msInterval = setMsInterval();
}

function onContinue() {
    countdown.timeLeft = countdown.pausedTime;

    switchPauseContinue();

    countdown.intervalId = setTimeInterval();
    countdown.msInterval = setMsInterval();
}

function updateMS(ms) {
    const timeElements = getTimeElements();
    timeElements.milliseconds.textContent = formatMs(ms);
}

function onPause() {
    countdown.pausedTime = countdown.timeLeft;
    clearInterval(countdown.intervalId);

    countdown.pausedMs = countdown.msLeft;
    clearInterval(countdown.msInterval);
    switchPauseContinue();
}

function onClear2() {
    clearInterval(countdown.intervalId);
    clearInterval(countdown.msInterval);

    countdown.timeLeft = countdown.targetTimeMs;
    countdown.pausedTime = 0;
    countdown.msLeft = 999;
    countdown.pausedMs = 0;
    
    // update timer elements
    updateCountdownTime(...Object.values(fromMsToTime(countdown.timeLeft)));
    updateMS(0);

    removeBlink('main-timer');
    
    // update object holding data info

    showStartButton();
    stopAlarmSound();
}

function showStartButton() {
    domElem('#continueBtn').classList.add('hide');
    domElem('#pauseBtn').classList.add('hide');

    domElem('#startBtn').classList.remove('hide');
}

function domElem(selector) {
    return document.querySelector(selector);
}

function onBack() {
    showHideControls();
    onClear2();
    onClear();
}

function onClear() {
    const timeElements = getTimeElements();
    pressedNumbers.count = 0;
    pressedNumbers.data = [0, 0, 0, 0, 0, 0];

    timeElements.hours.textContent = '00';
    timeElements.minutes.textContent = '00';
    timeElements.seconds.textContent = '00';
    timeElements.milliseconds.textContent = '000';

    countdown.timeLeft = 0;
    countdown.pausedTime = 0;
    countdown.msLeft = 999;
    countdown.pausedMs = 0;
}

function showHideControls() {
    const controlButtons = document.querySelector('.control-buttons');
    const hasHideClass = controlButtons.classList.contains('hide');

    const controls = document.querySelector('.controls');
    const backBtn = document.querySelector('#backBtn');

    if (hasHideClass) {
        controlButtons.classList.remove('hide');
        controls.classList.add('hide');
        backBtn.classList.remove('hide');
    } else {
        controlButtons.classList.add('hide');
        controls.classList.remove('hide');
        backBtn.classList.add('hide');
    }
}

function addControlButtons() {
    const container = document.querySelector('.container');
    const controlButtons = document.createElement('div');
    controlButtons.classList.add('control-buttons');
    controlButtons.classList.add('hide');

    const startBtn = document.createElement('div');
    startBtn.id = 'startBtn';
    startBtn.textContent = 'START';
    startBtn.classList.add('button');

    const pauseBtn = document.createElement('div');
    pauseBtn.id = 'pauseBtn';
    pauseBtn.classList.add('hide');
    pauseBtn.textContent = 'PAUSE';
    pauseBtn.classList.add('button');

    const continueBtn = document.createElement('div');
    continueBtn.id = 'continueBtn';
    continueBtn.classList.add('hide');
    continueBtn.textContent = 'CONTINUE';
    continueBtn.classList.add('button');

    const clearBtn = document.createElement('div');
    clearBtn.id = 'clearBtn2';
    clearBtn.textContent = 'CLEAR';
    clearBtn.classList.add('button');

    const backBtn = document.createElement('div');
    backBtn.id = 'backBtn';
    backBtn.textContent = '<< Back';
    backBtn.classList.add('hide');

    controlButtons.appendChild(startBtn);
    controlButtons.appendChild(pauseBtn);
    controlButtons.appendChild(continueBtn);
    controlButtons.appendChild(clearBtn);

    
    container.appendChild(controlButtons);
    container.appendChild(backBtn);
}

function addBlink(className) {
    document.querySelector(`.${className}`).classList.add('blink-class');
}

function removeBlink(className) {
    document.querySelector(`.${className}`).classList.remove('blink-class');
}

// function addRemoveBlink(className) {
//     const blinkClass = 'blink-class';
//     const hasBlink = elem.classList.contains(blinkClass);

//     if (hasBlink) {
//         elem.classList.remove(blinkClass);
//     } else {
//         elem.classList.add('blink-class');
//     }
// }

function switchPauseContinue() {
    const pauseHasHideClass = document.querySelector('#pauseBtn').classList.contains('hide');

    if (pauseHasHideClass) {
        document.querySelector('#pauseBtn').classList.remove('hide');
        document.querySelector('#continueBtn').classList.add('hide');
    } else {
        document.querySelector('#pauseBtn').classList.add('hide');
        document.querySelector('#continueBtn').classList.remove('hide');
    }
}

function startAlarmSound() {
    countdown.audio = new Audio('Alarm-Clock.mp3'); // not the best idea
    countdown.audio.load();
    countdown.audio.play();
    countdown.audio.loop = true;
}

function stopAlarmSound() {
    const hasAudio = countdown.audio;

    if (hasAudio) {
        countdown.audio.pause();
    } else {
        countdown.audio = new Audio('Alarm-Clock.mp3');
    }
}

function setTimeInterval() {
    return setInterval(() => {
        countdown.timeLeft -= 1000;

        // update countdown timer
        
        updateCountdownTime(...Object.values(fromMsToTime(countdown.timeLeft)));

        // update ms-timer
        if (countdown.timeLeft < 1) {
            domElem('#pauseBtn').classList.add('hide');
            addBlink('main-timer');
            startAlarmSound();
            clearInterval(countdown.intervalId);
        }

    }, 1000);
}

function setMsInterval() {
    return setInterval(() => {
        updateMS(countdown.msLeft);
        countdown.msLeft -= 21;

        if (countdown.timeLeft < 1 && countdown.msLeft <= 1) {
            updateMS(0);
            clearInterval(countdown.msInterval);
        }

        if (countdown.msLeft <= 1) {
            countdown.msLeft = 999;
        }

    }, 20);
}