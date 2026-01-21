function renderGivingData(data, ytd = false) {
  console.log("COMMA CHANGES V2")
  //Total Contribution
  const totalAmnt = document.getElementById('total_contribution');
  const amnt = data.TotalAmount || 0;
  // const formattedAmount = amnt < 0 ? `-$${Math.abs(amnt).toFixed(2)}` : `$${amnt.toFixed(2)}`;
  const formattedAmount = amnt < 0 ? `-$${Math.abs(amnt).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : `$${amnt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  totalAmnt.textContent = formattedAmount;

  //Transaction List
  const listContainer = document.getElementById('transaction-list');
  listContainer.innerHTML = ''; // clear previous items

  if (data.Donations && data.Donations.length > 0) {
    data.Donations.forEach((donation) => {
      const item = document.createElement('div');
      item.className = 'transaction-item';

      const date = new Date(donation.Donation_Date);
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      const amount = Number(donation.Amount);
      const formattedAmount = amount < 0 ? `-$${Math.abs(amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

      item.innerHTML = `
        <div class="transaction-date">${formattedDate}</div>
        <div class="transaction-name">${donation.Payment_Type || 'N/A'}</div>
        <div class="transaction-amount">${formattedAmount}</div>
      `;

      listContainer.appendChild(item);
    });

    document.getElementById("my_giving_loader").style.display = 'none';
    listContainer.style.display = 'block';
    listContainer.style.overflow = 'auto';
    document.getElementById("transaction-title").style.display = 'block';


  } else if (data.Donations && data.Donations.length === 0 && !ytd) {
    document.getElementById("my_giving_loader").style.display = 'none';
    const noDataMsg = document.createElement('div');
    noDataMsg.className = 'no-data-message';
    noDataMsg.textContent = 'No transactions found for the selected date range.';
    noDataMsg.style.fontFamily = 'Poppins, sans-serif';
    listContainer.appendChild(noDataMsg);
    listContainer.style.display = 'block';
    listContainer.style.overflow = 'hidden';
    document.getElementById("transaction-title").style.display = 'block';

  } else {
    document.getElementById("my_giving_loader").style.display = 'none';
    document.getElementById("transaction-title").style.display = 'none';
    listContainer.style.display = 'none';
  }
}

async function loadMyGivings() {
  try {
    const jwtToken = localStorage.getItem("mpp-widgets_JwtToken");
    console.log("JWT Token", jwtToken);


    const response = await fetch(
      `${baseURL}/api/My/FilteredGiving`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    console.log(response);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const YTDData = await response.json();
    console.log("My Givings", YTDData);

    renderGivingData(YTDData, true);

  } catch (error) {
    console.log("My Givings Detail Error -", error);
  }
}

// Date Picker Initialization
let locale = {
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthsShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],
  today: 'Today',
  clear: 'Clear',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: 'hh:mm aa',
  firstDay: 0
}

let dp1 = new AirDatepicker('#startDatePicker', {
  locale: locale,
  position({ $datepicker, $target, $pointer }) {
    const dpWidth = $datepicker.offsetWidth;
    const dpHeight = $datepicker.offsetHeight;

    const left = (window.innerWidth / 2) - (dpWidth / 2);

    const coords = $target.getBoundingClientRect();
    const top = coords.bottom + window.scrollY + 12;

    $datepicker.style.left = `${left}px`;
    $datepicker.style.top = `${top}px`;

    if ($pointer) {
      $pointer.style.display = 'block';
      $pointer.style.position = 'absolute';
      $pointer.style.top = '-10px';
      $pointer.style.left = '12px';
      $pointer.style.clipPath = 'polygon(50% 20%, 0 100%, 100% 100%)';
      $pointer.style.backgroundColor = '#8e8a8aff';
      $pointer.innerHTML = '';
    }
  },
  dateFormat: 'M/d/yyyy',
  maxDate: new Date(),
  onSelect({ date, formattedDate, datepicker }) {
    datepicker.hide(); // close the datepicker after date selection
    endInput.value = '';
    dp2.clear({ silent: true });
    dp2.selectedDates = [];
    dp2.viewDate = new Date();
    dp2.update({
      minDate: date
    });
  }
});

let dp2 = new AirDatepicker('#endDatePicker', {
  locale: locale,
  position({ $datepicker, $target, $pointer }) {
    const dpWidth = $datepicker.offsetWidth;
    const dpHeight = $datepicker.offsetHeight;

    const left = (window.innerWidth / 2) - (dpWidth / 2);

    const coords = $target.getBoundingClientRect();
    const top = coords.bottom + window.scrollY + 12;

    $datepicker.style.left = `${left}px`;
    $datepicker.style.top = `${top}px`;

    if ($pointer) {
      $pointer.style.display = 'block';
      $pointer.style.position = 'absolute';
      $pointer.style.top = '-10px';
      $pointer.style.right = '12px';
      $pointer.style.clipPath = 'polygon(50% 20%, 0 100%, 100% 100%)';
      $pointer.style.backgroundColor = '#8e8a8aff';
      // $pointer.style.transform = 'translateX(-50%)';

      // Reset width/height so borders work

      // // Create the triangle with borders
      // $pointer.style.borderLeft = '8px solid transparent';
      // $pointer.style.borderRight = '8px solid transparent';
      // $pointer.style.borderBottom = '8px solid #ccc'; // border color (outer gray)

      // // Optional inner arrow (white fill)
      // const inner = document.createElement('div');
      // inner.style.position = 'absolute';
      // inner.style.top = '2px'; // shift down a bit
      // inner.style.left = '-6px'; // center it
      // inner.style.width = 0;
      // inner.style.height = 0;
      // inner.style.borderLeft = '7px solid transparent';
      // inner.style.borderRight = '7px solid transparent';
      // inner.style.borderBottom = '7px solid #fff'; // background of datepicker

      // // clear previous inner if already appended
      $pointer.innerHTML = '';
      // $pointer.appendChild(inner);
    }
  },
  dateFormat: 'M/d/yyyy',
  maxDate: new Date(),
  onSelect({ date, formattedDate, datepicker }) {
    datepicker.hide(); // close the datepicker after date selection
  }
});



// Utility to format the date as D/M/YY
function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');

  return `${year}-${paddedMonth}-${paddedDay} 00:00:00`;
}

function parseInputDate(str) {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  if (date.getMonth() === month && date.getDate() === day && date.getFullYear() === year) {
    return date;
  }
  return null;
}

const submitBtn = document.getElementById('submitButton');
const radios = document.querySelectorAll('input[name="choice"]');
const startInput = document.getElementById('startDatePicker');
const endInput = document.getElementById('endDatePicker');
const resetBtn = document.getElementById('resetButton');

(function () {
  const errorDiv = document.getElementById('errorDiv');
  const errorMessage = document.getElementById('errorMessage');

  window.showError = function (message) {
    errorMessage.textContent = message;
    errorDiv.style.display = 'flex';
  };

  window.hideError = function () {
    errorMessage.textContent = '';
    errorDiv.style.display = 'none';
  };
})();

function setLoadingState(button, isLoading) {
  const btnText = button.querySelector('.btn-text');
  const spinner = button.querySelector('.fa-spinner');

  if (isLoading) {
    button.classList.add('button-onload');
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
  } else {
    button.classList.remove('button-onload');
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
  }
}

submitBtn.addEventListener('click', async () => {

  setLoadingState(submitBtn, true);
  const startStr = startInput.value.trim();
  const endStr = endInput.value.trim();

  let startDate, endDate;

  if (startStr && endStr) {
    startDate = parseInputDate(startStr);
    endDate = parseInputDate(endStr);

    hideError();

    if (!startStr && !endStr) {
      showError('Please select a date range');
      setLoadingState(submitBtn, false);
      return;
    }

    if ((startStr && !endStr) || (!startStr && endStr)) {
      showError('Please provide both start and end dates.');
      setLoadingState(submitBtn, false);
      return;
    }
  } else {
    hideError();
    const selectedRadio = document.querySelector('input[name="choice"]:checked');
    if (!selectedRadio) {
      showError('Please select a date range');
      setLoadingState(submitBtn, false);
      return;
    }

    const today = new Date();
    if (selectedRadio.value === 'lastYear') {
      const lastYear = today.getFullYear() - 1;
      startDate = new Date(lastYear, 0, 1);
      endDate = new Date(lastYear, 11, 31);
    } else {
      const monthsToSubtract = parseInt(selectedRadio.value, 10);
      startDate = new Date(today.getFullYear(), today.getMonth() - monthsToSubtract, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    }
  }

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  console.log('Start:', formattedStart);
  console.log('End:', formattedEnd);

  const params = new URLSearchParams({
    start: formattedStart,
    end: formattedEnd,
  });

  const url = `${baseURL}/api/My/FilteredGiving?${params.toString()}`;

  try {
    const jwtToken = localStorage.getItem("mpp-widgets_JwtToken");
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      showError('Something went wrong. Please try again later.');
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    renderGivingData(data);

  } catch (error) {
    showError('Something went wrong. Please try again later.');
    console.log("Filtered Giving Error -", error);
  }
  setLoadingState(submitBtn, false);
});

function uncheckRadios() {
  radios.forEach(radio => {
    radio.checked = false;
  });
}

function clearInputs() {
  hideError();
  startInput.value = '';
  endInput.value = '';

  // Clear dates
  dp1.clear({ silent: true });
  dp2.clear({ silent: true });

  // Manually reset internal view state
  dp1.selectedDates = [];
  dp1.viewDate = new Date();
  dp1.update();

  dp2.selectedDates = [];
  dp2.viewDate = new Date();
  dp2.update();

}

[startInput, endInput].forEach(input => {
  input.addEventListener('focus', uncheckRadios);
  input.addEventListener('click', uncheckRadios);
});

radios.forEach(radio => {
  radio.addEventListener('change', () => {
    clearInputs();
  });
});

resetBtn.addEventListener('click', async () => {
  setLoadingState(resetBtn, true);
  uncheckRadios();
  clearInputs();
  await loadMyGivings();
  setLoadingState(resetBtn, false);
});


document.addEventListener("DOMContentLoaded", function () {
  loadMyGivings();
  loadMyStatement(new Date().getFullYear());
  const tabs = document.querySelectorAll('.dsm-tab');
  const filterSection = document.getElementById('filter-section');

  function updateFilterVisibility() {
    const activeTab = document.querySelector('.dsm-tab.dsm-active');
    if (activeTab && activeTab.classList.contains('custom')) {
      filterSection.style.display = 'block';
      clearInputs();
      uncheckRadios();
      hideError();
    } else {
      filterSection.style.display = 'none';
      loadMyGivings();
    }
  }

  const maxAttempts = 20;
  let attempts = 0;

  const interval = setInterval(() => {
    updateFilterVisibility();
    attempts++;
    const activeTab = document.querySelector('.dsm-tab.dsm-active');
    if (activeTab || attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 100);

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      setTimeout(updateFilterVisibility, 50);
    });
  });

  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
 
  setTimeout(() => {
    globalThis.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, 500);
});

let url;
async function loadMyStatement(selectedYear) {
  try {
    const jwtToken = localStorage.getItem("mpp-widgets_JwtToken");

    const response = await fetch(
      `${baseURL}/v1.0/api/My/YearlyStatement?year=${selectedYear}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (!response.ok) {
      document.getElementById("statment_chart").style.display = 'none';
      // document.querySelector(".my_givings_no_content_text_module").style.display = "flex";
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const monthlyData = await response.json();
    console.log("statement - ", monthlyData);
    
    document.getElementById("statment_chart").style.display = 'block';
    url = monthlyData.url;
    document.querySelectorAll('.download_button').forEach(button =>{
      button.style.pointerEvents = Number(monthlyData.Total_Amount) == 0 ? 'none' : 'auto';
      button.style.opacity = Number(monthlyData.Total_Amount) == 0 ? 0.5 : 1;
    })
    const categories = Object.keys(monthlyData.MonthlyBreakdown);
    const seriesData = Object.values(monthlyData.MonthlyBreakdown);

    const currentYear = new Date().getFullYear().toString();

    const options = {
      series: [{
        name: 'Contributions',
        data: seriesData
      }],
      chart: {
        type: 'bar',
        height: 500,
        toolbar: { show: false },
        events: {
          dataPointMouseEnter: function (event, chartContext, { seriesIndex, dataPointIndex, w }) {
            const value = w.globals.series[seriesIndex][dataPointIndex];
            const tooltipEl = document.querySelector('.apexcharts-tooltip');
            if (!tooltipEl) return;

            if (dataPointIndex == 11)
              tooltipEl.classList.add('last-child-tooltip');
            else
              tooltipEl.classList.remove('last-child-tooltip');

            if(value < 0){
              tooltipEl.classList.add('tooltip-negative');
              if (dataPointIndex == 11)
                tooltipEl.classList.add('last-child-negative');
              else
                tooltipEl.classList.remove('last-child-negative');
            }
            else{
              tooltipEl.classList.remove('tooltip-negative');
            }
          },
          mounted: function (chartContext, config) {
            applyPathClasses();
          },
          updated: function (chartContext, config) {
            applyPathClasses();
          }
        }
      },
      plotOptions: {
        bar: {
          distributed: true,
          columnWidth: 42,
          borderRadius: 8,
          borderRadiusApplication: 'end',
          states: {
            hover: {
              filter: {
                type: 'none'
              }
            },
            active: {
              filter: {
                type: 'none'
              }
            }
          }
        }
      },
      states: {
        hover: {
          filter: { type: 'none' }
        },
        active: {
          filter: { type: 'none' }
        }
      },
      fill: {
        opacity: 1
      },
      legend: {
        show: false,
      },
      colors: [function ({ dataPointIndex, w }) {
        if (!w || !w.config || !w.config.xaxis || !w.config.xaxis.categories) {
          return '#000000'; // fallback color
        }
        const month = w.config.xaxis.categories[dataPointIndex];
        const currentMonthShort = new Date().toLocaleString('default', { month: 'short' }).replace('.', '');
        const monthNormalized = month.replace('.', '');
        if (selectedYear == currentYear && monthNormalized === currentMonthShort) {
          return '#99E1F9';
        }
        return '#005B78';
      }],
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: true,
        borderColor: '#D1D5DB',
        position: 'back',
        strokeDashArray: 0,
        padding: {top: 30, bottom: 10},
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: '#005B78',
            fontSize: '12px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
          },
          formatter: function (value) {
            return value.toUpperCase();
          }
        },
        axisTicks: {
          show: false
        },
        axisBorder: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#005B78',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '10px',
            fontWeight: 600,
          },
          formatter: function (val) {
            return `$${val}`;
          }
        }
      },
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const month = w.globals.labels[dataPointIndex];
          const amount = series[seriesIndex][dataPointIndex];
          const formattedAmount = amount > 0 ? `$${amount.toLocaleString()}` : `-$${Math.abs(amount).toLocaleString()}`;
          const currentMonthShort = new Date().toLocaleString('default', { month: 'short' }).replace('.', '');
          const monthNormalized = month.replace('.', '');
          const isCurrentMonth = selectedYear == currentYear && monthNormalized === currentMonthShort;
          const monthColor = isCurrentMonth ? '#00B5EF' : '#005B78';
          return `
            <div style="
              background: #f9fafb;
              padding: 6px 10px;
              border-radius: 14px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.15);
              border: 1px solid #e5e7eb;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
              font-family: 'Poppins', sans-serif;
              font-size: 13px;
              font-weight: 600;
              color: #2d3748;
              position: relative;
            ">
              <span>${month.toUpperCase()}</span>
              <span style="
                background: ${monthColor};
                color: #ffffff;
                padding: 4px 10px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 700;
                min-width: 50px;
                text-align: center;
              ">
                ${formattedAmount}
              </span>

              <!-- Pointer -->
              <div class="custom-pointer" style="
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%) rotate(180deg);
                width: 12px;
                height: 12px;
                background: #f9fafb;
                border-right: 1px solid #e5e7eb;
                border-top: 1px solid #e5e7eb;
                box-shadow: 0 -2px 4px rgba(0,0,0,0.08);
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                ${amount < 0 ? 
                  `transform: translateX(-50%);
                  top: -10px;
                  ` : ''};
              "></div>
            </div>
        `;
        },
        appendTo: document.body,
        followCursor: false
      },
    };

    const chartContainer = document.getElementById('statment_chart');
    const chart = new ApexCharts(chartContainer, options);
    chart.render();
    chart.addEventListener('dataPointMouseEnter', function(event, chartContext, { dataPointIndex }) {
      const tooltipEl = document.querySelector('.apexcharts-tooltip');
      if (!tooltipEl || !chartContainer) return;

      // Wait until ApexCharts positions it
      requestAnimationFrame(() => {
        const scrollLeft = chartContainer.scrollLeft;
        const currentLeft = parseFloat(getComputedStyle(tooltipEl).left) || 0;

        // Compensate for scroll offset
        tooltipEl.style.left = `${currentLeft + scrollLeft}px`;
        tooltipEl.style.transform = 'translateX(-50%)'; // center over bar
      });
    });

  } catch (error) {
    console.log("My Givings Error -", error);
  }
}

function applyPathClasses() {
  var paths = document.querySelectorAll('#statment_chart path');
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    var raw = path.getAttribute('val') || path.getAttribute('data-val');
    var num = Number(raw);

    if (!isNaN(num) && num > 0) {
      path.classList.add('positive');
      path.classList.remove('negative');
    } else {
      path.classList.add('negative');
      path.classList.remove('positive');
    }
  }
}

document.querySelectorAll('.download_button.mobile, .download_button.desktop')
  .forEach(button => {
    button.addEventListener('click', function() {
      if (url != "File not found. Please contact Calvary team") {
        document.querySelector('.download_button.mobile').href = url;
        document.querySelector('.download_button.desktop').href = url;
        if(!document.getElementById('statementSuccessMessage')){
          const statementErrorDiv = document.getElementById('statementErrorDiv');
          const sucSymbol = document.createElement('div');
          sucSymbol.classList.add('sucSymbol');
          const statementSuccessMessage = document.createElement('p');
          statementSuccessMessage.id = 'statementSuccessMessage';
          statementSuccessMessage.textContent = "Successfully downloaded";
          statementErrorDiv.appendChild(sucSymbol);
          statementErrorDiv.appendChild(statementSuccessMessage);
          setTimeout(()=>{
            statementErrorDiv.removeChild(sucSymbol);
            statementErrorDiv.removeChild(statementSuccessMessage);
          }, 5000)
        }
      } else {
        document.querySelector('.download_button.mobile').removeAttribute("href");
        document.querySelector('.download_button.desktop').removeAttribute("href");
        if(!document.getElementById('statementErrorMessage')){
          const statementErrorDiv = document.getElementById('statementErrorDiv');
          const errSymbol = document.createElement('div');
          errSymbol.classList.add('errSymbol');
          errSymbol.textContent = '!';
          const statementErrorMessage = document.createElement('p');
          statementErrorMessage.id = 'statementErrorMessage';
          statementErrorMessage.textContent = "Oops! Encountered an issue. Try again later or contact WebHelp@CalvaryFTL.org";
          statementErrorDiv.appendChild(errSymbol);
          statementErrorDiv.appendChild(statementErrorMessage);
          setTimeout(()=>{
            statementErrorDiv.removeChild(errSymbol);
            statementErrorDiv.removeChild(statementErrorMessage);
          }, 5000)
        }
      }
    });
  });

const currentYear = new Date().getFullYear();
const select_year = document.getElementById('options');
const selected = document.getElementById('selected');
selected.textContent = currentYear;

for (let i = 0; i < 4; i++) {
  const option = document.createElement('div');
  option.value = currentYear - i;
  option.textContent = currentYear - i;
  option.classList.add('option');
  select_year.appendChild(option);

  option.addEventListener('click', async function () {
    const selectedYear = this.value;
    selected.textContent = selectedYear;
    select_year.style.display = 'none';
    selected.classList.remove('open');
    selected.classList.remove('active');

    select_year.querySelectorAll('.option').forEach(o => o.classList.remove('active'));
    this.classList.add('active');

    document.getElementById("statment_chart").innerHTML = '';
    document.getElementById('statementErrorDiv').innerHTML = '';
    await loadMyStatement(selectedYear);
  });
  if(i==0)
    option.classList.add('active');
}

selected.addEventListener('click', () => {
  const isOpen = select_year.style.display === 'block';
  select_year.style.display = isOpen ? 'none' : 'block';
  selected.classList.toggle('open', !isOpen);
  selected.classList.toggle('active');
  if(isOpen){
    select_year.querySelectorAll('.option').forEach(o => {
      if(selected.textContent == o.textContent)
        o.classList.add('active')
    });
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-dropdown')) {
    const isOpen = select_year.style.display === 'block';
    if(isOpen){
      select_year.style.display = 'none';
      selected.classList.remove('open');
      selected.classList.toggle('active');
      select_year.querySelectorAll('.option').forEach(o => {
        if(selected.textContent == o.textContent)
          o.classList.add('active')
      });
    }
  }
});

document.getElementById('options').addEventListener('mouseenter',()=>{
  document.getElementById('options').querySelectorAll('.option')
    .forEach(o => o.classList.remove('active'));
})