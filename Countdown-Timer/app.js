window.onload = () => {
    const el = getDomElem();

    const pressedNumbers = {
        count: 0,
        data: [0, 0, 0, 0, 0, 0],
    };

    const timerValues = {
        startTime: 0,
        inputTime: 0,
        targetTime: 0,
        timeLeft: 0,
        intervalId: null,
        audio: null
    };

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


    function getDomElem() {
        return {
            timer: document.querySelector('.timer'),
            hours: document.querySelector('.hours'),
            minutes: document.querySelector('.minutes'),
            seconds: document.querySelector('.seconds'),
        }
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
        if (clicked.tagName == 'DIV' && clicked.className == 'numpad-button' && pressedNumbers.count < 6) {
            // move numbers to the left
            pressedNumbers.data.push(clicked.textContent);
            pressedNumbers.data.shift();
            pressedNumbers.count += 1;
            setTimer(pressedNumbers.data.join(''));
        }
    }

    function setTimer(str) {
        // can be /.{2}/g probably
        const arr = str.toString().match(/.{1,2}/g);
        // assign time
        updateTimer(arr[0], arr[1], arr[2]);
    }

    // after each iteration
    function updateTimer(h, min, sec) {
        el.hours.textContent = h.toString().padStart(2, 0);
        el.minutes.textContent = min.toString().padStart(2, 0);
        el.seconds.textContent = sec.toString().padStart(2, 0);
    }

    function fromTimeToMs(h, min, sec) {
        h = Number(h);
        min = Number(min);
        sec = Number(sec);

        let ms = sec;
        ms += min * 60;
        ms += h * 3600;
        ms *= 1000;
        return ms;
    }

    function fromMsToTime(ms) {
        document.querySelector('.hours').textContent = (Math.floor(ms / 1000 / 60 / 60)).toString().padStart(2, 0);
        document.querySelector('.minutes').textContent = (Math.floor(ms / 1000 / 60) % 60).toString().padStart(2, 0);
        document.querySelector('.seconds').textContent = (Math.floor(ms / 1000) % 60).toString().padStart(2, 0);
        document.querySelector('.milliseconds').textContent = (ms % 1000).toString().padStart(3, 0);
    }



    function onSet() {
        let h = el.hours.textContent;
        let m = el.minutes.textContent;
        let s = el.seconds.textContent;

        let ms = fromTimeToMs(h, m, s);
        if (ms === 0) {
            ms = 10000;
        }

        timerValues.inputTime = ms;
        fromMsToTime(ms);

        showHideControls();
        showStartButton();
    }

    function onStart() {
        startBtn.classList.add('hide');
        pauseBtn.classList.remove('hide');

        timerValues.targetTime = Date.now() + timerValues.inputTime;
        timerValues.intervalId = setTimeInterval();
    }

    function onContinue() {
        timerValues.targetTime = Date.now() + timerValues.timeLeft;
        timerValues.intervalId = setTimeInterval();
        switchPauseContinue();
    }

    function onPause() {
        clearInterval(timerValues.intervalId);
        switchPauseContinue();
    }

    function onClear2() {
        clearInterval(timerValues.intervalId);
        fromMsToTime(timerValues.inputTime);

        removeBlink();
        showStartButton();
        stopAlarmSound();
    }

    function showStartButton() {
        document.querySelector('#continueBtn').classList.add('hide');
        document.querySelector('#pauseBtn').classList.add('hide');

        document.querySelector('#startBtn').classList.remove('hide');
    }

    function onBack() {
        showHideControls();
        onClear2();
        onClear();
    }

    function onClear() {
        pressedNumbers.count = 0;
        pressedNumbers.data = [0, 0, 0, 0, 0, 0];
        
        fromMsToTime(0);
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

    function addBlink() {
        document.querySelector('.timer').classList.add('blink-class');
    }

    function removeBlink() {
        document.querySelector('.timer').classList.remove('blink-class');
    }

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
        timerValues.audio = new Audio('Alarm-Clock.mp3'); // not the best idea
        timerValues.audio.load();
        timerValues.audio.play();
        timerValues.audio.loop = true;
    }

    function stopAlarmSound() {
        if (timerValues.audio != null) {
            timerValues.audio.pause();
        } else {
            timerValues.audio = new Audio('Alarm-Clock.mp3');
        }
    }

    function setTimeInterval() {

        return setInterval(() => {
            timerValues.timeLeft = timerValues.targetTime - Date.now();
            fromMsToTime(timerValues.timeLeft);


            if (timerValues.timeLeft <= 0) {
                document.querySelector('#pauseBtn').classList.add('hide');
                addBlink();
                startAlarmSound();
                clearInterval(timerValues.intervalId);
                fromMsToTime(0);
            }


        }, 100);
    }

}
