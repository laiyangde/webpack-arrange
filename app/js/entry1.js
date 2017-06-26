import {formatTime} from './format.js';
import '../css/index';
var app = document.getElementById('app');
var time = document.getElementById('time');
var timer = setInterval(updateClock, 1000);

function updateClock() {
  time.innerHTML = formatTime(new Date());
}
// Edit these styles to see them take effect immediately
app.style.display = 'table-cell';
app.style.width = '100px';
app.style.height = '400px';
app.style.border = '3px solid #339';
app.style.background = '#99d';
app.style.color = '#333';
app.style.textAlign = 'center';
app.style.verticalAlign = 'middle';

// if (module.hot) {
//   module.hot.accept();
//   module.hot.dispose(function() {
//     clearInterval(timer);
//   });
// }
