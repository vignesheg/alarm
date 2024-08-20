/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}

document.addEventListener('DOMContentLoaded', function () {
    let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
    let alarmTimeouts = [];

    // Function to update the current time display
    function updateCurrentTime() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString();
    }

    // Function to populate time options for hours, minutes, and period (AM/PM)
    function populateTimeOptions() {
        const hoursSelect = document.getElementById('alarm-hours');
        const minutesSelect = document.getElementById('alarm-minutes');

        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i.toString().padStart(2, '0');
            hoursSelect.appendChild(option);
        }
        for (let i = 0; i < 60; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i.toString().padStart(2, '0');
            minutesSelect.appendChild(option);
        }
    }

    // Function to save a new alarm to local storage
    function saveAlarm(alarmTimeString, alarmTime) {
        alarms.push({ timeString: alarmTimeString, time: alarmTime.getTime() });
        localStorage.setItem('alarms', JSON.stringify(alarms));
        displayAlarms();
        scheduleAlarm(alarmTimeString, alarmTime);
    }

    // Function to display all saved alarms
    function displayAlarms() {
        const alarmsList = document.getElementById('alarms-list');
        alarmsList.innerHTML = '';
        alarms.forEach((alarm, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = alarm.timeString;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function () {
                deleteAlarm(index);
            });

            listItem.appendChild(deleteButton);
            alarmsList.appendChild(listItem);
        });
    }

    // Function to schedule an alarm and set a timeout for when it should trigger
    function scheduleAlarm(alarmTimeString, alarmTime) {
        const now = new Date();

        if (alarmTime < now) {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }

        const timeDifference = alarmTime.getTime() - now.getTime();
        const timeoutId = setTimeout(function () {
            triggerAlarm(alarmTimeString);
        }, timeDifference);

        alarmTimeouts.push(timeoutId);
    }

    // Function to delete an alarm
    function deleteAlarm(index) {
        clearTimeout(alarmTimeouts[index]);
        alarms.splice(index, 1);
        alarmTimeouts.splice(index, 1);
        localStorage.setItem('alarms', JSON.stringify(alarms));
        displayAlarms();
    }

    // Function to trigger the alarm (vibrate the device)
    function triggerAlarm(alarmTimeString) {
        document.getElementById('alarm-status').textContent = 'Alarm ringing for ' + alarmTimeString + '!';
        vibrateDevice([1000, 500, 1000, 500, 1000]); // Vibrate pattern: vibrate for 1s, pause for 0.5s, repeat 3 times
        alert('Time to wake up!');
    }

    // Function to vibrate the device using the standard Web API
    function vibrateDevice(pattern) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
            console.log("Vibration started with pattern: " + pattern);
        } else {
            console.log("Vibration not supported on this device.");
        }
    }

    // Function to set an alarm based on user input
    document.getElementById('set-alarm-btn').addEventListener('click', function () {
        const hours = document.getElementById('alarm-hours').value;
        const minutes = document.getElementById('alarm-minutes').value;
        const period = document.getElementById('alarm-period').value;

        if (hours && minutes && period) {
            const alarmTimeString = `${hours}:${minutes.padStart(2, '0')} ${period}`;
            const alarmTime = new Date();

            if (period === 'PM' && hours !== '12') {
                alarmTime.setHours(parseInt(hours) + 12);
            } else if (period === 'AM' && hours === '12') {
                alarmTime.setHours(0);
            } else {
                alarmTime.setHours(parseInt(hours));
            }

            alarmTime.setMinutes(parseInt(minutes));
            alarmTime.setSeconds(0);

            saveAlarm(alarmTimeString, alarmTime);
            document.getElementById('alarm-status').textContent = `Alarm set for ${alarmTimeString}`;
        } else {
            document.getElementById('alarm-status').textContent = 'Please set a valid time.';
        }
    });

    // Initialize the app: populate time options, display the current time, and load existing alarms
    populateTimeOptions();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    displayAlarms();
});


