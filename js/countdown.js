// Countdown to Thursday 8:00 PM in America/New_York (observes DST)
var TIME_ZONE = 'America/New_York';

function tzOffset(date, timeZone) {
  var dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  var parts = dtf.formatToParts(date);
  var map = {};
  parts.forEach(function(p) { map[p.type] = p.value; });
  var asUTC = Date.UTC(+map.year, +map.month - 1, +map.day, +map.hour, +map.minute, +map.second);
  return (asUTC - date.getTime()) / 60000; // offset in minutes
}

function getZonedTimestamp(year, month, day, hour, minute, second, timeZone) {
  var utc = Date.UTC(year, month - 1, day, hour, minute, second);
  // iterate to converge on correct instant accounting for DST offset at that local wall time
  for (var i = 0; i < 3; i++) {
    var offsetMin = tzOffset(new Date(utc), timeZone);
    var newUtc = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMin * 60000;
    if (newUtc === utc) break;
    utc = newUtc;
  }
  return utc;
}

function getZoneNowParts(timeZone) {
  var dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone,
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  var parts = dtf.formatToParts(new Date());
  var map = {};
  parts.forEach(function(p) { map[p.type] = p.value; });
  return {
    weekday: map.weekday,
    year: +map.year,
    month: +map.month,
    day: +map.day,
    hour: +map.hour,
    minute: +map.minute,
    second: +map.second
  };
}

var weekdayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Compute initial target (next Thursday at 20:00 America/New_York)
function computeNextThursdayTarget() {
  var nowParts = getZoneNowParts(TIME_ZONE);
  var curWeekday = weekdayOrder.indexOf(nowParts.weekday);
  var targetWeekday = 4; // Thursday
  var daysUntil = (targetWeekday - curWeekday + 7) % 7;
  // If today is Thursday, check whether we've passed 20:00 local time
  if (daysUntil === 0) {
    if (nowParts.hour > 20 || (nowParts.hour === 20 && (nowParts.minute > 0 || nowParts.second > 0))) {
      daysUntil = 7;
    }
  }
  var targetYear = nowParts.year;
  var targetMonth = nowParts.month;
  var targetDay = nowParts.day + daysUntil;
  var targetHour = 20;
  var targetMinute = 0;
  var targetSecond = 0;
  var targetEpoch = getZonedTimestamp(targetYear, targetMonth, targetDay, targetHour, targetMinute, targetSecond, TIME_ZONE);
  return {
    year: targetYear,
    month: targetMonth,
    day: targetDay,
    hour: targetHour,
    minute: targetMinute,
    second: targetSecond,
    epoch: targetEpoch
  };
}

var target = computeNextThursdayTarget();

function updateCountdown() {
  var now = Date.now();
  var distance = target.epoch - now;

  if (distance <= 0) {
    // advance target by exactly 7 days in local terms
    target.day += 7;
    target.epoch = getZonedTimestamp(target.year, target.month, target.day, target.hour, target.minute, target.second, TIME_ZONE);
    distance = target.epoch - now;
  }

  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  var text = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ';
  var el = document.getElementById('countdown');
  var elMobile = document.getElementById('countdown-mobile');
  if (el) el.innerHTML = text;
  if (elMobile) elMobile.innerHTML = text;
}

updateCountdown();
setInterval(updateCountdown, 1000);