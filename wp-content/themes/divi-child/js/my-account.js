console.log("Name chnage");
let groupSize = 0;
async function loadRegisteredEvents() {
    try {
      // Replace jwttoken with authToken  
      const jwtToken = localStorage.getItem("mpp-widgets_JwtToken");

        const response = await fetch(
            `${baseURL}/v1.1/api/My/Event/Registered`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
            }
        );

        if (!response.ok) {
            document.getElementById("my_events_list_accordion").style.display = 'none';
            document.querySelector(".my_event_no_content_text_module").style.display = "flex";
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const events = await response.json();
        console.log("Registered Events:", events);

        const accordionContainer = document.getElementById("my_events_list_accordion");

        if (!accordionContainer) {
            console.warn("Parent div #my_events_list_accordion not found");
            return;
        }
        if (events.length == 0) {
            document.getElementById("my_account_loader").style.display = 'none';
            document.querySelector(".my_event_no_content_text_module").style.display = "flex";
            return;
        }
        else {
            document.getElementById("my_account_loader").style.display = 'none';
            document.getElementById("my_events_list_accordion").style.display = 'block';
        }

        accordionContainer.innerHTML = ""; // Clear previous content

        events.forEach((event, index) => {
            const {
                Event_Title,
                Event_Start_Date,
                Location,
                Web_Description,
                Meeting_Instructions,
                Congregation_Name,
                IsRecurring,
                Online_Meeting_URL,
                Online_Meeting_Link
            } = event;

            const eventDate = new Date(Event_Start_Date);
            const formattedDate = eventDate.toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric"
            });

            const formattedTime = eventDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });

            const locationName = Location && Location.Location_Name ? Location.Location_Name : Congregation_Name;

            // Conditionally render Meeting Instructions block only if present
            const meetingInstructionsHTML = Meeting_Instructions
                ? `
                <div class="my_event_mt_div">
                <p class="my_event_desc_color">
                    <span class="my_event_mt_span">Meeting Instructions:</span>
                    ${Meeting_Instructions}
                </p>
                </div>
                `
                : '';

            const descriptionHTML = Web_Description ?
                `<div class="my_event_desc_color">
                    <span class="my_event_mt_span">Event Description:</span>
                    ${Web_Description}
                </div>`:
            '';

            const recurringHTML = IsRecurring ?
                `<div class="my_event_recurring_div">
                    <div class="my_event_recurring_icon"></div>
                    <p>recurring</p>
                  </div>`:
            '';

            const online_HTML = Online_Meeting_Link || Online_Meeting_URL ?
            `<div class="online_button_div">
              <a class="online_button" target="_blank" href=${Online_Meeting_Link || Online_Meeting_URL}>
                JOIN ONLINE
                </a>
            </div>`:
            '';

            const eventHTML = `
            <div class="et_pb_toggle et_pb_module et_pb_accordion_item et_pb_accordion_item_${index}  et_pb_toggle_close">
            <h5 class="et_pb_toggle_title">
                <div class="event-info">
                <p class="event-datetime">${formattedDate} – <strong
                    style="font-weight: 600; font-style:normal;">${formattedTime}</strong></p>
                <p class="event-name">${Event_Title}</p>
                </div>
            </h5>
            <div class="et_pb_toggle_content clearfix">
                <div class="my_event_content_div">
                  <div class="location_recurring_div">
                    <div class="my_event_location_div">
                        <div class="my_events_campus_icon"></div>
                        <p>${locationName}</p>
                    </div>
                    ${recurringHTML}
                  </div>
                  ${meetingInstructionsHTML}
                  <div class="event_mobile_date_time">
                      Date &amp; Time: <span class="my_event_date_time_span">${formattedDate} – ${formattedTime}</span>
                  </div>
                  ${descriptionHTML}
                  ${online_HTML}
                </div>
            </div>
            </div>
            `;

            accordionContainer.insertAdjacentHTML("beforeend", eventHTML);
        });
    } catch (error) {
        console.log("My Events Error -", error);
    }
}

function fetchName() {
    const token = localStorage.getItem("mpp-widgets_JwtToken");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const accountDiv = document.getElementById("my_account_name");
    // const nameTitle = accountDiv.querySelector(".dtq-card-title");
    console.log("Payload:", payload);
    let UserName = payload.Nickname || payload.FirstName || "User";
    // nameTitle.innerHTML = "Hello, " + UserName + "!";    
    
    // Update MY ACCOUNT text if element exists
    const myAccountText = document.querySelector(".et_pb_text_inner p");
    if (myAccountText && myAccountText.textContent.trim() === "MY ACCOUNT") {
        myAccountText.innerHTML = "Hello, " + UserName + "!";
    }
}

function formatMeetingDate(startISO, endISO) {
    const start = new Date(startISO);
    const end = new Date(endISO);

    const dateStr = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    const getHourMinutePeriod = (date) => {
        const options = { hour: "numeric", minute: "2-digit", hour12: true};
        const timeStr = date.toLocaleTimeString("en-US", options); 
        let [hm, period] = timeStr.split(" ");
        let [hour, minute] = hm.split(":");
        period = period.toLowerCase();
        // Remove minutes if "00"
        return {
            hour,
            minute: minute === "00" ? "" : minute,
            period
        };
    };

    const startTime = getHourMinutePeriod(start);
    const endTime = getHourMinutePeriod(end);

    let startStr = startTime.hour;
    if (startTime.minute) startStr += `:${startTime.minute}`;
    let endStr = endTime.hour;
    if (endTime.minute) endStr += `:${endTime.minute}`;

    const timeStr = `${startStr}-${endStr}${endTime.period}`;

    return `${dateStr}, ${timeStr}`;

}

async function loadMyGroups() {
    try {
        const jwtToken = localStorage.getItem("mpp-widgets_JwtToken");

        const response = await fetch(
            `${baseURL}/api/My/V2/Group`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
            }
        );

        if (!response.ok) {
            document.getElementById("groups-carousel").style.display = 'none';
            document.querySelector(".my_groups_no_content_text_module").style.display = "flex";
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const groups = await response.json();
        console.log("My Groups", groups);
        
        const swiperWrapper = document.querySelector('#groups-carousel .swiper-wrapper');
        groupSize = groups.GroupsList.length;
        if(groupSize == 0){
            document.querySelector(".my_groups_no_content_text_module").style.display = "flex";
            document.getElementById("groups-carousel").style.display = 'none';
            return;
        }
        groups.GroupsList.forEach((group, index) =>{
            const {
                Group_ID,
                Group_Name,
                Next_Meeting_Start_Date,
                Next_Meeting_End_Date,
                IsLeader
            } = group
            let next_meeting = null;
            if(Next_Meeting_End_Date && Next_Meeting_Start_Date ){
                next_meeting = formatMeetingDate(Next_Meeting_Start_Date, Next_Meeting_End_Date);
            }
            // swiper-slide-${index == 0 ? "active": index == groupSize-1 ? "prev" : "next"}
            if (swiperWrapper) {
            const newSlide = document.createElement('div');
            newSlide.className = `dsm_card_carousel_child dsm_card_carousel_child_${index} grp_cls swiper-slide`;
            newSlide.innerHTML = `
                <a target="_blank" href="https://calvaryftlbeta.cloudapps.ministryplatform.cloud/connect/group/${Group_ID}">
                <div class="et_pb_module_inner">
                <div class="dsm_card_wrapper et_pb_text_align_left et_pb_bg_layout_light">
                    <h6 class="dsm_card_title et_pb_module_header">${Group_Name}</h6>
                    <div class="dsm_card_carousel_child_subtitle">
                        ${next_meeting ? "NEXT MEETING:" : "NO UPCOMING MEETING"}
                    </div>
                    <div class="dsm_card_carousel_child_description">
                    ${next_meeting ? `<p>${next_meeting}</p>`: ''}
                    ${ IsLeader ? '<div class="grp-leader"></div>': ''}
                    </div>
                </div>
                </div></a>
            `;
            swiperWrapper.appendChild(newSlide);
            }
        })
        
        groupCarouselNavigation();
         
    } catch (error) {
        console.log("My Groups Error -", error);
    }
}

function groupCarouselNavigation() {
    if (groupSize <= 3 && window.innerWidth >= 1270 || groupSize <= 2 && window.innerWidth >= 768 || groupSize == 1 && window.innerWidth < 768) {
        document.querySelector("#groups-carousel .swiper-button-next").style.display = 'none';
        document.querySelector("#groups-carousel .swiper-button-prev").style.display = 'none';
    }else{
        document.querySelector("#groups-carousel .swiper-button-next").style.display = 'inline-flex';
        document.querySelector("#groups-carousel .swiper-button-prev").style.display = 'inline-flex';
    }
    const updatedParams = {
            direction: "horizontal",
            effect: "default",
            slider_effect_shadows: false,
            slider_effect_coverflow_rotate: 30,
            slider_effect_coverflow_depth: 0,
            loop: false,
            infinite_smooth_scrolling: false,
            slide_to_show: groupSize >= 3 ? 3 : 2,
            slide_to_show_tablet: 2,
            slide_to_show_phone: 1,
            slide_to_scroll: 1,
            slide_to_scroll_tablet: 1,
            slide_to_scroll_phone: 1,
            space_between: 28,
            space_between_tablet: 25,
            space_between_phone: 25,
            centered_slides: false,
            multiple_slide_row: "off",
            slide_row: 1,
            slide_row_tablet: 1,
            slide_row_phone: 1,
            speed: 300,
            autoplay: false,
            autoplay_speed: 3000,
            autoplay_viewport: "",
            touch_move: true,
            grab: true,
            pause_on_hover: false,
            mousewheel: false,
            auto_height: true,
            equal_height: true,
            equal_height_tablet: true,
            equal_height_phone: true
        };
        
        const swiperContainer = document.querySelector('#groups-carousel .dsm_card_carousel_wrapper');
        if (swiperContainer) {
            swiperContainer.swiper.destroy(true, true);
        }
        
        swiperContainer.setAttribute('data-params', JSON.stringify([updatedParams]));


       const newSwiperInstance = new Swiper(swiperContainer, {
            // ...updatedParams,
            speed: updatedParams.speed,
            autoHeight: updatedParams.auto_height,
            grabCursor: updatedParams.grab,
            centeredSlides: updatedParams.centered_slides,
            effect: updatedParams.effect,
            breakpoints: {
            768: {
                slidesPerView: updatedParams.slide_to_show_tablet,
                slidesPerGroup: updatedParams.slide_to_scroll_tablet,
                spaceBetween: updatedParams.space_between_tablet,
                loop: groupSize > 2,
            },
            1270:{
                slidesPerView: updatedParams.slide_to_show,
                slidesPerGroup: updatedParams.slide_to_scroll,
                spaceBetween: updatedParams.space_between,
                loop: groupSize > 3,
            },
            200: {
                slidesPerView: updatedParams.slide_to_show_phone,
                slidesPerGroup: updatedParams.slide_to_scroll_phone,
                spaceBetween: updatedParams.space_between_phone,
                loop: groupSize > 1,
            },
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
        
        window.mySwiperInstance = newSwiperInstance;
        newSwiperInstance.update();

}

async function loadMyGivings(){
  try{
    const jwtToken = localStorage.getItem("mpp-widgets_JwtToken");

    const response = await fetch(
      `${baseURL}/api/My/GivingYearly`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (!response.ok) {
      document.getElementById("custom-chart").style.display = 'none';
      document.querySelector(".my_givings_no_content_text_module").style.display = "flex";
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const monthlyData = await response.json();
    console.log("My Givings", monthlyData);

    const allZero = monthlyData.every(item => item.Total_Amount === 0);    
    
    let shouldShowGiving = true; 
    const givingLink = document.getElementById("givingLink");

    if (allZero) {
      document.getElementById("custom_chart").style.display = 'none';
      document.querySelector(".my_givings_no_content_text_module").style.display = "flex";
      document.getElementById("my_giving_loader").style.display = 'none';
      shouldShowGiving = false; 
    } else {
      document.getElementById("custom_chart").style.display = 'block';
      document.querySelector(".my_givings_no_content_text_module").style.display = "none";
      document.getElementById("my_giving_loader").style.display = 'none';
      shouldShowGiving = true; 
    }

    if (shouldShowGiving) {
      givingLink.style.display = "inline-block";
    } else {
      givingLink.style.display = "none";
    }

    monthlyData.sort((a, b) => Number(a.Year) - Number(b.Year));

    const categories = monthlyData.map(item => item.Year);
    const seriesData = monthlyData.map(item => item.MonthlyBreakdown.Total || 0);

    const currentYear = new Date().getFullYear().toString();

    const options = {
      series: [{
        name: 'Contributions',
        data: seriesData
      }],
      chart: {
        type: 'bar',
        height: 250,
        toolbar: { show: false },
        events: {
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
          borderRadiusApplication: 'end' ,
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
      colors: [function({ dataPointIndex, w }) {
        if (!w || !w.config || !w.config.xaxis || !w.config.xaxis.categories) {
          return '#000000'; // fallback color
        }
        const year = w.config.xaxis.categories[dataPointIndex];
        if (year === currentYear) {
          return '#00b4ef';
        }
        return '#005B78';
      }],
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: true,
        borderColor: '#ffffff4d',
        position: 'back',
        strokeDashArray: 0,
      }, 
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: '#ffffff',
            fontSize: '12px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
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
            colors: '#ffffff',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '10px',
            fontWeight: 600,
          },
          formatter: function (val) {
            // return `$${val}`;
            return `$${val.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
          }
        }
      },
      tooltip: {
        custom: function({ dataPointIndex }) {
          const year = categories[dataPointIndex];
          const yearDataObj = monthlyData.find(item => item.Year === year);
          const data = yearDataObj ? yearDataObj.MonthlyBreakdown : {};
          
          const total = data.Total || 0;
          let html = `<div style="
            background: #ffffff;
            padding: 8px 12px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            font-family: 'Poppins', sans-serif;
            display: inline-block;
          ">`;

          const colors = ['#00B5EF', '#005B78']; 
          let index = 0;

          for (const [month, amount] of Object.entries(data)) {
            if (month.toLowerCase() === 'total') continue; 
            const bgColor = colors[index % 2];
            // const formattedAmount = amount < 0 ? `-$${Math.abs(amount)}` : `$${amount}`;
            const formattedAmount = amount < 0 ? `-$${Math.abs(amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            html += `
            <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 600; line-height: 16px; margin-bottom: 4px;">
            <span style="color: #374151; text-transform: uppercase">${month}</span>
            <span style="background-color: ${bgColor}; color: white; padding: 0px 8px; border-radius: 8px;">${formattedAmount}</span>
            </div>`;
            index++;
          }
          // const formattedTotal = total < 0 ? `-$${Math.abs(total)}` : `$${total}`;
          const formattedTotal = total < 0 ? `-$${Math.abs(total).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : `$${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

          html += `<div style="display: flex; justify-content: space-between; font-weight: 600; gap: 10px; margin-top: 8px;">
            <span style="color: #374151; font-size: 10px; line-height: 16px" >TOTAL</span>
            <span style="color: #4B5563 font-size: 12px; line-height: 14px">${formattedTotal}</span>
          </div>`;
          html += `</div>`;
          return html;
        }
      }
    };

    const chartContainer = document.getElementById('custom_chart');
    const chart = new ApexCharts(chartContainer, options);
    chart.render();

  } catch (error) {
        console.log("My Givings Error -", error);
    }
}

function applyPathClasses() {
  var paths = document.querySelectorAll('#custom_chart path');
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

document.addEventListener("DOMContentLoaded", function () {
    fetchName();
    loadRegisteredEvents();
    loadMyGroups();
    loadMyGivings();
});

window.addEventListener('resize', groupCarouselNavigation);