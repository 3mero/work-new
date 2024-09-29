document.getElementById('add-schedule-item').addEventListener('click', function () {
            const scheduleItems = document.getElementById('schedule-items');
            const newItem = document.createElement('div');
            newItem.className = 'schedule-item';
            newItem.innerHTML = `
                <select class="day-type">
                    <option value="work">أيام العمل</option>
                    <option value="off">أيام العطلة</option>
                </select>
                <input type="number" class="days-count" value="1" min="1" max="99">
                <input type="color" class="day-color" value="#FFFFFF">
                <span class="remove-item">X</span>
            `;
            newItem.querySelector('.remove-item').addEventListener('click', function () {
                newItem.remove();
                saveScheduleToLocal();
                savePinsToLocal();
            });
            scheduleItems.appendChild(newItem);
        });

        document.querySelectorAll('.remove-item').forEach(item => {
            item.addEventListener('click', function () {
                item.parentElement.remove();
                saveScheduleToLocal();
                savePinsToLocal();
            });
        });

        function generateCalendar(startDate, schedule, numberOfMonths = 12) {
            const calendar = document.getElementById('calendar');
            const statsBody = document.getElementById('stats-body');
            calendar.innerHTML = '';
            statsBody.innerHTML = '';
            const startDateObj = new Date(startDate);
            const today = new Date();
            let currentDate = new Date(startDate);
            let dayCount = 0;
            const totalDaysInSchedule = schedule.reduce((sum, item) => sum + parseInt(item.daysCount), 0);
            let isFirstWorkDayMonthSet = false;

            const stats = {};

            const cumulativeDays = [0];
            for (const item of schedule) {
                cumulativeDays.push(cumulativeDays[cumulativeDays.length - 1] + parseInt(item.daysCount));
            }

            function getDayType(dayIndex) {
                const index = cumulativeDays.findIndex(days => dayIndex < days) - 1;
                return schedule[index];
            }

            for (let month = 0; month < numberOfMonths; month++) {
                const monthDiv = document.createElement('div');
                monthDiv.className = 'month';

                const monthTitle = document.createElement('div');
                monthTitle.className = 'month-title';
                const monthNames = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                const monthIndex = (startDateObj.getMonth() + month) % 12;
                const year = startDateObj.getFullYear() + Math.floor((startDateObj.getMonth() + month) / 12);
                monthTitle.textContent = monthNames[monthIndex] + ' ' + year;

                const monthNumber = document.createElement('div');
                monthNumber.className = 'month-number';
                monthNumber.textContent = 'شهر ' + (monthIndex + 1);

                if (!isFirstWorkDayMonthSet && currentDate >= startDateObj) {
                    monthTitle.classList.add('highlight');
                    isFirstWorkDayMonthSet = true;
                }

                monthDiv.appendChild(monthNumber);
                monthDiv.appendChild(monthTitle);

                const monthTools = document.createElement('div');
                monthTools.className = 'month-tools';
                monthTools.innerHTML = `
                    <button class="edit-notes">✏️</button>
                    <label class="button-label">🎨
                        <input type="color" class="change-bg">
                    </label>
                `;
                monthDiv.appendChild(monthTools);

                const notesDropdown = document.createElement('div');
                notesDropdown.className = 'notes-dropdown';
                notesDropdown.innerHTML = `
                    <textarea placeholder="أدخل ملاحظاتك هنا"></textarea>
                    <button class="save-notes">حفظ</button>
                    <button class="edit-notes">تعديل</button>
                    <button class="delete-notes">حذف</button>
                `;
                monthDiv.appendChild(notesDropdown);

                const dayHeaders = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                dayHeaders.forEach(day => {
                    const dayHeader = document.createElement('div');
                    dayHeader.className = 'day-header';
                    dayHeader.textContent = day;
                    monthDiv.appendChild(dayHeader);
                });

                const firstDayOfMonth = new Date(year, monthIndex, 1);
                const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                const startDay = firstDayOfMonth.getDay();

                for (let i = 0; i < startDay; i++) {
                    const emptyDiv = document.createElement('div');
                    emptyDiv.className = 'day';
                    monthDiv.appendChild(emptyDiv);
                }

                let workDaysCount = 0;
                let offDaysCount = 0;
                const workColors = {};
                const offColors = {};

                for (let day = 1; day <= daysInMonth; day++) {
                    const dayDiv = document.createElement('div');
                    dayDiv.className = 'day';
                    dayDiv.id = `day-${month}-${day}`;
                    const fullDate = new Date(year, monthIndex, day);

                    let diffDays = Math.floor((fullDate - startDateObj) / (1000 * 60 * 60 * 24));
                    diffDays = ((diffDays + 1) % totalDaysInSchedule + totalDaysInSchedule) % totalDaysInSchedule;

                    const dayType = getDayType(diffDays);

                    if (dayType.dayType === 'work') {
                        dayDiv.classList.add('work-day');
                        dayDiv.style.backgroundColor = dayType.dayColor;
                        workDaysCount++;
                        workColors[dayType.dayColor] = (workColors[dayType.dayColor] || 0) + 1;
                    } else {
                        dayDiv.classList.add('day-off');
                        dayDiv.style.backgroundColor = dayType.dayColor;
                        offDaysCount++;
                        offColors[dayType.dayColor] = (offColors[dayType.dayColor] || 0) + 1;
                    }

                    if (
                        fullDate.getFullYear() === today.getFullYear() &&
                        fullDate.getMonth() === today.getMonth() &&
                        fullDate.getDate() === today.getDate()
                    ) {
                        dayDiv.classList.add('today');
                    }

                    dayDiv.textContent = day;

                    const pin = document.createElement('span');
                    pin.className = 'pin';
                    pin.textContent = '📌';
                    pin.style.display = 'none';
                    dayDiv.appendChild(pin);

                    dayDiv.addEventListener('dblclick', function () {
                        pin.style.display = pin.style.display === 'none' ? 'block' : 'none';
                        savePinsToLocal();
                        loadPinsFromLocal();
                    });

                    monthDiv.appendChild(dayDiv);

                    dayCount++;
                }

                calendar.appendChild(monthDiv);
                currentDate = new Date(year, monthIndex + 1, 1);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${monthNames[monthIndex]}</td>
                    <td>${year}</td>
                    <td>${workDaysCount}</td>
                    <td>${offDaysCount}</td>
                    <td>${Object.entries(workColors).map(([color, count]) => `<span style="background-color:${color}; padding: 2px 5px;">${count}</span>`).join(' ')}</td>
                    <td>${Object.entries(offColors).map(([color, count]) => `<span style="background-color:${color}; padding: 2px 5px;">${count}</span>`).join(' ')}</td>
                `;
                statsBody.appendChild(row);

                const editNotesButton = monthTools.querySelector('.edit-notes');
                const changeBgInput = monthTools.querySelector('.change-bg');
                const notesTextarea = notesDropdown.querySelector('textarea');
                const saveNotesButton = notesDropdown.querySelector('.save-notes');
                const editNotesDropdownButton = notesDropdown.querySelector('.edit-notes');
                const deleteNotesButton = notesDropdown.querySelector('.delete-notes');

                editNotesButton.addEventListener('click', function () {
                    notesDropdown.style.display = notesDropdown.style.display === 'none' ? 'block' : 'none';
                });

                changeBgInput.addEventListener('input', function () {
                    monthDiv.style.backgroundColor = this.value;
                    saveScheduleToLocal();
                });

                saveNotesButton.addEventListener('click', function () {
                    alert('تم حفظ الملاحظات');
                    notesDropdown.style.display = 'none';
                    saveNotes();
                });

                editNotesDropdownButton.addEventListener('click', function () {
                    notesTextarea.disabled = !notesTextarea.disabled;
                    saveNotes();
                });

                deleteNotesButton.addEventListener('click', function () {
                    if (confirm('هل أنت متأكد من حذف الملاحظات؟')) {
                        notesTextarea.value = '';
                        notesDropdown.style.display = 'none';
                        saveNotes();
                    }
                });
            }
            loadPinsFromLocal(); // تحميل الدبابيس عند إنشاء الجداول
            loadNotesFromLocal(); // تحميل الملاحظات عند إنشاء الجداول
            loadMonthBackgrounds(); // تحميل الخلفيات عند إنشاء الجداول
        }

        document.getElementById('generate-schedule').addEventListener('click', function () {
            const startDate = document.getElementById('start-date').value;
            const numberOfMonths = parseInt(document.getElementById('month-count').value); // الحصول على عدد الأشهر المحدد
            const scheduleItems = document.querySelectorAll('.schedule-item');
            const schedule = [];

            scheduleItems.forEach(item => {
                const dayType = item.querySelector('.day-type').value;
                const daysCount = item.querySelector('.days-count').value;
                const dayColor = item.querySelector('.day-color').value;
                schedule.push({ dayType, daysCount, dayColor });
            });

            generateCalendar(startDate, schedule, numberOfMonths); // تمرير عدد الأشهر المحدد
            saveScheduleToLocal();
            saveBackgroundSettings();
            saveNotes();
            loadNotesFromLocal();
            applyMonthBackgrounds();
        });

        const toggleStatsButton = document.getElementById('toggle-stats');
        const statsTable = document.getElementById('stats-table');
        toggleStatsButton.addEventListener('click', () => {
            statsTable.style.display = statsTable.style.display === 'none' ? 'table' : 'none';
        });

        function updatePin(dayDiv) {
            const pin = dayDiv.querySelector('.pin');
            if (pin) {
                pin.style.display = pin.style.display === 'none' ? 'block' : 'none';
                savePinsToLocal();
            }
        }

        function updateCurrentDate() {
            const now = new Date();
            const formattedDate = now.toLocaleDateString('ar-LY', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('current-date').textContent = formattedDate;
        }
        setInterval(updateCurrentDate, 1000);

        document.getElementById('save-schedule').addEventListener('click', () => {
            html2canvas(document.body).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL();
                link.download = 'schedule.png';
                link.click();
            });
        });

        document.getElementById('open-bg-settings').addEventListener('click', function () {
            document.getElementById('bg-settings-modal').style.display = 'flex';
        });

        document.getElementById('close-bg-settings').addEventListener('click', function () {
            document.getElementById('bg-settings-modal').style.display = 'none';
        });

        document.getElementById('page-bg-color-picker').addEventListener('input', function () {
            document.body.style.backgroundColor = this.value;
            saveBackgroundSettings();
        });

        document.getElementById('shift-schedule-bg-color-picker').addEventListener('input', function () {
            document.querySelector('.shift-schedule').style.backgroundColor = this.value;
            saveBackgroundSettings();
        });

        document.getElementById('stats-table-bg-color-picker').addEventListener('input', function () {
            document.getElementById('stats-table').style.backgroundColor = this.value;
            saveBackgroundSettings();
        });

        document.getElementById('work-calendar-bg-color-picker').addEventListener('input', function () {
            document.querySelector('.work-calendar').style.backgroundColor = this.value;
            saveBackgroundSettings();
        });

        document.getElementById('month-bg-color-picker').addEventListener('input', function () {
            document.querySelectorAll('.month').forEach(month => {
                month.style.backgroundColor = this.value;
            });
            saveBackgroundSettings();
        });

        function saveScheduleToLocal() {
            const startDate = document.getElementById('start-date').value;
            const scheduleItems = document.querySelectorAll('.schedule-item');
            const schedule = [];

            scheduleItems.forEach(item => {
                const dayType = item.querySelector('.day-type').value;
                const daysCount = item.querySelector('.days-count').value;
                const dayColor = item.querySelector('.day-color').value;
                schedule.push({ dayType, daysCount, dayColor });
            });

            const monthBackgrounds = {};
            document.querySelectorAll('.month').forEach(monthDiv => {
                const monthTitle = monthDiv.querySelector('.month-title').textContent;
                monthBackgrounds[monthTitle] = monthDiv.style.backgroundColor || '#FFFFFF';
            });

            const scheduleData = {
                startDate: startDate,
                schedule: schedule,
                monthBackgrounds: monthBackgrounds,
                employeeName: document.getElementById('employee-name').textContent.split(': ')[1],
                employeeStartDate: document.getElementById('employee-start-date').textContent.split(': ')[1]
            };

            localStorage.setItem('workSchedule', JSON.stringify(scheduleData));
        }

        function saveBackgroundSettings() {
            const backgroundSettings = {
                pageBg: document.body.style.backgroundColor,
                shiftScheduleBg: document.querySelector('.shift-schedule').style.backgroundColor,
                statsTableBg: document.getElementById('stats-table').style.backgroundColor,
                workCalendarBg: document.querySelector('.work-calendar').style.backgroundColor,
                monthBgs: {}
            };
            document.querySelectorAll('.month').forEach(month => {
                const monthTitle = month.querySelector('.month-title').textContent;
                backgroundSettings.monthBgs[monthTitle] = month.style.backgroundColor;
            });
            localStorage.setItem('backgroundSettings', JSON.stringify(backgroundSettings));
        }

        function saveNotes() {
            const notes = {};
            const noteTimestamps = {};
            document.querySelectorAll('.month').forEach((monthDiv, index) => {
                const notesTextarea = monthDiv.querySelector('.notes-dropdown textarea');
                const monthTitle = monthDiv.querySelector('.month-title').textContent;
                notes[monthTitle] = notesTextarea.value;

                const editNotesButton = monthDiv.querySelector('.edit-notes');
                if (notesTextarea.value.trim()) {
                    editNotesButton.textContent = '📝';
                    noteTimestamps[monthTitle] = new Date().toISOString();
                } else {
                    editNotesButton.textContent = '✏️';
                    noteTimestamps[monthTitle] = '';
                }
            });
            localStorage.setItem('notes', JSON.stringify(notes));
            localStorage.setItem('noteTimestamps', JSON.stringify(noteTimestamps));
            localStorage.setItem('backgroundSettings', JSON.stringify(backgroundSettings));

        }

        function loadNotesFromLocal() {
            const savedNotes = localStorage.getItem('notes');
            const savedNoteTimestamps = localStorage.getItem('noteTimestamps');
            if (savedNotes) {
                const notes = JSON.parse(savedNotes);
                const noteTimestamps = JSON.parse(savedNoteTimestamps);
                document.querySelectorAll('.month').forEach((monthDiv) => {
                    const monthTitle = monthDiv.querySelector('.month-title').textContent;
                    const notesTextarea = monthDiv.querySelector('.notes-dropdown textarea');
                    notesTextarea.value = notes[monthTitle] || '';

                    const editNotesButton = monthDiv.querySelector('.edit-notes');
                    if (notesTextarea.value.trim()) {
                        editNotesButton.textContent = '📝';
                    } else {
                        editNotesButton.textContent = '✏️';
                    }
                });
            }
        }

        function loadScheduleFromLocal() {
            const savedSchedule = localStorage.getItem('workSchedule');
            if (savedSchedule) {
                const scheduleData = JSON.parse(savedSchedule);
                document.getElementById('start-date').value = scheduleData.startDate;

                const scheduleItemsContainer = document.getElementById('schedule-items');
                scheduleItemsContainer.innerHTML = '';

                scheduleData.schedule.forEach(item => {
                    const newItem = document.createElement('div');
                    newItem.className = 'schedule-item';
                    newItem.innerHTML = `
                        <select class="day-type">
                            <option value="work" ${item.dayType === 'work' ? 'selected' : ''}>أيام العمل</option>
                            <option value="off" ${item.dayType === 'off' ? 'selected' : ''}>أيام العطلة</option>
                        </select>
                        <input type="number" class="days-count" value="${item.daysCount}" min="1" max="99">
                        <input type="color" class="day-color" value="${item.dayColor}">
                        <span class="remove-item">X</span>
                    `;
                    newItem.querySelector('.remove-item').addEventListener('click', function () {
                        newItem.remove();
                        saveScheduleToLocal();
                        savePinsToLocal();
                    });
                    scheduleItemsContainer.appendChild(newItem);
                });

                generateCalendar(scheduleData.startDate, scheduleData.schedule);
                loadPinsFromLocal();

                if (scheduleData.monthBackgrounds) {
                    document.querySelectorAll('.month').forEach(monthDiv => {
                        const monthTitle = monthDiv.querySelector('.month-title').textContent;
                        if (scheduleData.monthBackgrounds[monthTitle]) {
                            monthDiv.style.backgroundColor = scheduleData.monthBackgrounds[monthTitle];
                        }
                    });
                }

                if (scheduleData.employeeName && scheduleData.employeeStartDate) {
                    document.getElementById('employee-name').textContent = `اسم الموظف: ${scheduleData.employeeName}`;
                    document.getElementById('employee-start-date').textContent = `تاريخ البدء: ${scheduleData.employeeStartDate}`;
                    document.getElementById('employee-info').style.display = 'block';
                }
            }
        }

function loadBackgroundSettings() {
    const savedBackgroundSettings = localStorage.getItem('backgroundSettings');
    if (savedBackgroundSettings) {
        const backgroundSettings = JSON.parse(savedBackgroundSettings);

        document.body.style.backgroundColor = backgroundSettings.pageBg || '#2C2C2C';
        document.querySelector('.shift-schedule').style.backgroundColor = backgroundSettings.shiftScheduleBg || '#3A3A3A';
        document.getElementById('stats-table').style.backgroundColor = backgroundSettings.statsTableBg || '#3A3A3A';
        document.querySelector('.work-calendar').style.backgroundColor = backgroundSettings.workCalendarBg || '#3A3A3A';
        document.querySelectorAll('.month').forEach(month => {
            month.style.backgroundColor = backgroundSettings.monthBg || '#444444';
        });
        document.getElementById('page-bg-color-picker').value = backgroundSettings.pageBg || '#2C2C2C';
        document.getElementById('shift-schedule-bg-color-picker').value = backgroundSettings.shiftScheduleBg || '#3A3A3A';
        document.getElementById('stats-table-bg-color-picker').value = backgroundSettings.statsTableBg || '#3A3A3A';
        document.getElementById('work-calendar-bg-color-picker').value = backgroundSettings.workCalendarBg || '#3A3A3A';
        document.getElementById('month-bg-color-picker').value = backgroundSettings.monthBg || '#444444';
    }
}

window.addEventListener('load', function() {
    loadScheduleFromLocal();
    loadBackgroundSettings();
    loadNotesFromLocal();
    loadPinsFromLocal();
    loadMonthBackgrounds();
    initializeBackgroundChangeListeners();
});

        document.getElementById('page-bg-color-picker').addEventListener('input', function() {
            document.body.style.backgroundColor = this.value;
            saveBackgroundSettings();
        });

        document.getElementById('shift-schedule-bg-color-picker').addEventListener('input', function() {
            document.querySelector('.shift-schedule').style.backgroundColor = this.value;
            saveBackgroundSettings();
        });

        document.getElementById('stats-table-bg-color-picker').addEventListener('input', function() {
            document.getElementById('stats-table').style.backgroundColor = this.value;
            saveBackgroundSettings();
        });

        document.getElementById('work-calendar-bg-color-picker').addEventListener('input', function() {
            document.querySelector('.work-calendar').style.backgroundColor = this.value;
            saveBackgroundSettings();
        });

        document.getElementById('month-bg-color-picker').addEventListener('input', function() {
            document.querySelectorAll('.month').forEach(month => {
                month.style.backgroundColor = this.value;
            });
            saveBackgroundSettings();
        });

        document.getElementById('color-picker').addEventListener('input', function() {
            document.getElementById('all-notes-content').style.backgroundColor = this.value;
            saveBackgroundSettings();
        });

        window.addEventListener('load', function() {
            displaySavedSchedules();
            loadScheduleFromLocal();
            loadBackgroundSettings();
            loadNotesFromLocal();
            loadPinsFromLocal();
            MonthBackground();
            saveMonthBackground();
        });

        function savePinsToLocal() {
            const pins = {};
            document.querySelectorAll('.month').forEach((monthDiv) => {
                const monthTitle = monthDiv.querySelector('.month-title').textContent;
                const pinnedDays = [];
                monthDiv.querySelectorAll('.day').forEach((dayDiv, index) => {
                    const pin = dayDiv.querySelector('.pin');
                    if (pin && pin.style.display === 'block') {
                        pinnedDays.push(index);
                    }
                });
                pins[monthTitle] = pinnedDays;
            });
            localStorage.setItem('pinnedDays', JSON.stringify(pins));
        }

        function loadPinsFromLocal() {
            const savedPins = localStorage.getItem('pinnedDays');
            if (savedPins) {
                const pins = JSON.parse(savedPins);
                document.querySelectorAll('.month').forEach((monthDiv) => {
                    const monthTitle = monthDiv.querySelector('.month-title').textContent;
                    const pinnedDays = pins[monthTitle] || [];
                    monthDiv.querySelectorAll('.day').forEach((dayDiv, index) => {
                        const pin = dayDiv.querySelector('.pin');
                        if (pin) {
                            pin.style.display = pinnedDays.includes(index) ? 'block' : 'none';
                        }
                    });
                });
            }
        }

        document.getElementById('reset-page').addEventListener('click', function() {
            const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || [];
            const backgroundSettings = JSON.parse(localStorage.getItem('backgroundSettings')) || {};
            localStorage.clear();
            localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules)); // استثناء سجل المحفوظات
            localStorage.setItem('backgroundSettings', JSON.stringify(backgroundSettings)); // استثناء إعدادات الخلفية
            resetBackgrounds();
            location.reload();
        });

        document.getElementById('show-all-notes').addEventListener('click', function () {
            const notesList = document.getElementById('notes-list');
            notesList.innerHTML = `
                <div class="note-header">
                    <div class="note-title">اسم الشهر والسنة</div>
                    <div class="note-start-date">تاريخ البدء</div>
                    <div class="note-save-time">وقت الحفظ</div>
                    <div class="note-creation-time">تاريخ إنشاء الملاحظة</div>
                    <div class="note-text">النص</div>
                </div>
            `;

            const savedNotes = JSON.parse(localStorage.getItem('notes')) || {};
            const savedNoteTimestamps = JSON.parse(localStorage.getItem('noteTimestamps')) || {};

            Object.keys(savedNotes).forEach(monthTitle => {
                const noteText = savedNotes[monthTitle];
                const noteTimestamp = savedNoteTimestamps[monthTitle];
                if (noteText) {
                    const formattedDate = noteTimestamp ? formatDate(noteTimestamp) : 'غير محدد';
                    const formattedTime = noteTimestamp ? formatTime(noteTimestamp) : 'غير محدد';
                    const noteItem = document.createElement('div');
                    noteItem.className = 'note-item';
                    noteItem.innerHTML = `
                        <div>${monthTitle}</div>
                        <div>${document.getElementById('start-date').value}</div>
                        <div>${formattedTime}</div>
                        <div>${formattedDate}</div>
                        <textarea>${noteText}</textarea>
                        <div class="note-actions">
                            <button class="save-note">حفظ</button>
                            <button class="delete-note">حذف</button>
                        </div>
                    `;

                    noteItem.querySelector('.save-note').addEventListener('click', function () {
                        savedNotes[monthTitle] = noteItem.querySelector('textarea').value;
                        savedNoteTimestamps[monthTitle] = new Date().toISOString();
                        localStorage.setItem('notes', JSON.stringify(savedNotes));
                        localStorage.setItem('noteTimestamps', JSON.stringify(savedNoteTimestamps));
                        alert('تم حفظ الملاحظة');
                    });

                    noteItem.querySelector('.delete-note').addEventListener('click', function () {
                        if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
                            delete savedNotes[monthTitle];
                            delete savedNoteTimestamps[monthTitle];
                            localStorage.setItem('notes', JSON.stringify(savedNotes));
                            localStorage.setItem('noteTimestamps', JSON.stringify(savedNoteTimestamps));
                            noteItem.remove();
                            alert('تم حذف الملاحظة');
                        }
                    });

                    notesList.appendChild(noteItem);
                }
            });

            document.getElementById('all-notes-modal').style.display = 'flex';
        });

        document.getElementById('close-notes').addEventListener('click', function () {
            document.getElementById('all-notes-modal').style.display = 'none';
        });

        document.getElementById('change-bg-color').addEventListener('click', function () {
            document.getElementById('color-picker').click();
        });

        document.getElementById('color-picker').addEventListener('input', function () {
            document.getElementById('all-notes-content').style.backgroundColor = this.value;
            saveBackgroundSettings();
        });

        function formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('ar-EN', options);
        }

        function formatTime(dateString) {
            const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
            return new Date(dateString).toLocaleTimeString('ar-EN', options);
        }

        document.querySelectorAll('.color-picker-container input[type="color"]').forEach(input => {
            input.addEventListener('input', function() {
                const preview = this.nextElementSibling;
                preview.style.backgroundColor = this.value;
            });
        });

        function applyBackgroundSettings() {
            const backgroundSettings = JSON.parse(localStorage.getItem('backgroundSettings')) || {};
            document.body.style.backgroundColor = backgroundSettings.pageBg || '#2C2C2C';
            document.querySelector('.shift-schedule').style.backgroundColor = backgroundSettings.shiftScheduleBg || '#3A3A3A';
            document.getElementById('stats-table').style.backgroundColor = backgroundSettings.statsTableBg || '#3A3A3A';
            document.querySelector('.work-calendar').style.backgroundColor = backgroundSettings.workCalendarBg || '#3A3A3A';

            document.querySelectorAll('.month').forEach(month => {
                const monthTitle = month.querySelector('.month-title').textContent;
                month.style.backgroundColor = backgroundSettings.monthBgs[monthTitle] || '#444444';
            });
        }

        function resetBackgrounds() {
            document.body.style.backgroundColor = '#FFFFFF';
            document.querySelector('.shift-schedule').style.backgroundColor = '#FFFFFF';
            document.getElementById('stats-table').style.backgroundColor = '#FFFFFF';
            document.querySelector('.work-calendar').style.backgroundColor = '#FFFFFF';
            document.querySelectorAll('.month').forEach(month => {
                month.style.backgroundColor = '#FFFFFF';
            });

            document.getElementById('page-bg-color-picker').value = '#FFFFFF';
            document.getElementById('shift-schedule-bg-color-picker').value = '#FFFFFF';
            document.getElementById('stats-table-bg-color-picker').value = '#FFFFFF';
            document.getElementById('work-calendar-bg-color-picker').value = '#FFFFFF';
            document.getElementById('month-bg-color-picker').value = '#FFFFFF';

            saveBackgroundSettings();
        }

        document.getElementById('delete-all-notes').addEventListener('click', function () {
            if (confirm('هل أنت متأكد من حذف جميع الملاحظات؟')) {
                localStorage.removeItem('notes');
                localStorage.removeItem('noteTimestamps');
                document.getElementById('notes-list').innerHTML = `
                    <div class="note-header">
                        <div class="note-title">اسم الشهر والسنة</div>
                        <div class="note-start-date">تاريخ البدء</div>
                        <div class="note-save-time">وقت الحفظ</div>
                        <div class="note-creation-time">تاريخ إنشاء الملاحظة</div>
                        <div class="note-text">النص</div>
                    </div>
                `;
                alert('تم حذف جميع الملاحظات');
            }
        });


        document.getElementById('save-schedule-confirm').addEventListener('click', function () {
            const scheduleName = document.getElementById('schedule-name').value.trim();
            const startDate = document.getElementById('start-date').value; // استخدم تاريخ أول يوم بدء العمل

            if (!scheduleName) {
                alert('يرجى إدخال اسم السجل');
                return;
            }

            const scheduleData = JSON.parse(localStorage.getItem('workSchedule')) || {};
            scheduleData.startDate = startDate; // حفظ تاريخ أول يوم بدء العمل في البيانات
            const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || [];
            const scheduleId = Date.now();
            const scheduleRecord = {
                id: scheduleId,
                name: `${scheduleName} - ${startDate}`, // احفظ الاسم مع تاريخ أول يوم بدء العمل
                data: scheduleData,
                startDate: startDate,
                createdDate: new Date().toLocaleString('ar-LY')
            };
            savedSchedules.push(scheduleRecord);
            localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
            displaySavedSchedules();

            const saveModal = document.getElementById('save-modal');
            saveModal.style.display = 'none';
            alert('تم الحفظ بنجاح');
        });

        function displaySavedSchedules() {
            const savedSchedulesList = document.getElementById('saved-schedules-list');
            const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || [];
            savedSchedulesList.innerHTML = '';
            savedSchedules.forEach(schedule => {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'saved-schedule-item';
                scheduleItem.innerHTML = `
                    <span>${schedule.name} - ${schedule.createdDate}</span>
                    <button class="delete-saved-schedule" data-id="${schedule.id}">حذف</button>
                `;
                scheduleItem.addEventListener('click', function (e) {
                    if (e.target.tagName !== 'BUTTON') {
                        loadSavedSchedule(schedule.id);
                    }
                });
                savedSchedulesList.appendChild(scheduleItem);
            });
            document.querySelectorAll('.delete-saved-schedule').forEach(button => {
                button.addEventListener('click', function (e) {
                    e.stopPropagation();
                    deleteSavedSchedule(button.getAttribute('data-id'));
                });
            });
        }

        function loadSavedSchedule(scheduleId) {
            const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || [];
            const schedule = savedSchedules.find(sch => sch.id === parseInt(scheduleId));
            if (schedule) {
                localStorage.setItem('workSchedule', JSON.stringify(schedule.data));
                document.getElementById('start-date').value = schedule.startDate;

                // إعادة تحميل الجدول والبيانات المحفوظة
                loadScheduleFromLocal();
                loadNotesFromLocal();
                loadPinsFromLocal();
                applyMonthBackgrounds();
                saveMonthBackground();

                // عرض اسم السجل وتاريخ أول يوم عمل أعلى الشاشة
                document.getElementById('employee-name').textContent = `اسم السجل: ${schedule.name}`;
                document.getElementById('employee-start-date').textContent = `تاريخ أول يوم عمل: ${schedule.startDate}`;
                document.getElementById('employee-info').style.display = 'block';
            }
        }

        function deleteSavedSchedule(scheduleId) {
            let savedSchedules = JSON.parse(localStorage.getItem('savedSchedules')) || [];
            savedSchedules = savedSchedules.filter(sch => sch.id !== parseInt(scheduleId));
            localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
            displaySavedSchedules();
        }

        function applyMonthBackgrounds() {
            const savedSchedule = JSON.parse(localStorage.getItem('workSchedule')) || {};
            const monthBackgrounds = savedSchedule.monthBackgrounds || {};
            document.querySelectorAll('.month').forEach(monthDiv => {
                const monthTitle = monthDiv.querySelector('.month-title').textContent;
                if (monthBackgrounds[monthTitle]) {
                    monthDiv.style.backgroundColor = monthBackgrounds[monthTitle];
                }
            });
        }


        window.addEventListener('click', function (e) {
            const saveModal = document.getElementById('save-modal');
            if (e.target === saveModal) {
                saveModal.style.display = 'none';
            }
        });

      function initializeBackgroundChangeListeners() {
        document.querySelectorAll('.change-bg').forEach(input => {
            input.addEventListener('input', function() {
                const monthTitle = this.closest('.month').querySelector('.month-title').textContent;
                const newColor = this.value;
                this.closest('.month').style.backgroundColor = newColor;
                saveMonthBackground(monthTitle, newColor);
            });
        });
    }

function saveMonthBackground(monthTitle, color) {
    const savedBackgrounds = JSON.parse(localStorage.getItem('monthBackgrounds')) || {};
    savedBackgrounds[monthTitle] = color;
    localStorage.setItem('monthBackgrounds', JSON.stringify(savedBackgrounds));
}


function loadMonthBackgrounds() {
    const savedBackgrounds = JSON.parse(localStorage.getItem('monthBackgrounds')) || {};
    document.querySelectorAll('.month').forEach(monthDiv => {
        const monthTitle = monthDiv.querySelector('.month-title').textContent;
        if (savedBackgrounds[monthTitle]) {
            monthDiv.style.backgroundColor = savedBackgrounds[monthTitle];
            monthDiv.querySelector('.change-bg').value = savedBackgrounds[monthTitle];
        }
    });
}