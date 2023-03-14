//get weeks of the current month
function getWeeksOfCurrentMonth() {
	let year= new Date().getFullYear();
	
	let month=new Date().getMonth();
	const weeks = [],
		firstDate = new Date(year, month, 1),
		lastDate = new Date(year, month + 1, 0),
		numDays = lastDate.getDate();

	let dayOfWeekCounter = firstDate.getDay();

	for (let date = 1; date <= numDays; date++) {
		if (dayOfWeekCounter === 0 || weeks.length === 0) {
		  weeks.push([]);
		}
		weeks[weeks.length - 1].push(date);
		dayOfWeekCounter = (dayOfWeekCounter + 1) % 7;
	}

	return weeks
		.filter((w) => !!w.length)
		.map((w) => ({
		  start: w[0],
		  end: w[w.length - 1],
		  dates: w,
	}));
}

//renderWeeks() function renders html weeks dropdown list to the page.
function renderWeeksToDropdown(dropdownId){
	let options = "<option value='0'>Select a Week</option>";
	const weeks = getWeeksOfCurrentMonth();
	
	// Create current date object from a date string
	let date = new Date();

	// Get year, month, and day part from the date
	let year = date.toLocaleString("default", { year: "numeric" });
	let month = date.toLocaleString("default", { month: "2-digit" });
	let day = date.toLocaleString("default", { day: "2-digit" });

	// Generate yyyy-mm-dd date string
	let formattedDate = year + "-" + month + "-";
	
	weeks.forEach((dates, index) => {
	  //if day less than 9 prepend 0 to italic
	  let startDay=dates.start;
	  let endDay=dates.end;
	  if(startDay<=9){startDay='0'+startDay;}
	  if(endDay<=9){endDay='0'+endDay;}
	  options +='<option value="'+formattedDate+startDay+'|'+formattedDate+endDay+'">Week '+(index+1)+' ('+dates.start+' to '+dates.end+') '+new Date().toLocaleString("en-US", { month: "long" })+'</option>'; 
	});	
	
	document.getElementById("dropdownId").innerHTML = options;
}

function alertMessage(message){
	document.getElementById("alert").innerHTML = '<div class="alert alert-danger" role="alert" id="alert">'+message+'.</div>';
}
//getWeather() fetches the New York each week weather information from public API.
async function getWeatherInfoFromAPI(week) {
	let dateRange=week.split("|");
    let url = 'https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&timezone=America/New_York&daily=temperature_2m_max,temperature_2m_min&start_date='+dateRange[0]+'&end_date='+dateRange[1];
    try {
        let info = await fetch(url);
        return await info.json();
    } catch (error) {
		alertMessage("An error Occurred!");
		document.getElementById("weatherInfos").innerHTML="";
    }
}

 
async function renderWeekWeather() {
	let week=document.getElementById("dropdownId").value;
	if(week==0){
		alertMessage("Please select a week.");
		document.getElementById("weatherInfos").innerHTML="";
	}
	else{
		try {
			let weatherInfos = await getWeatherInfoFromAPI(week);
			let html = '<table class="table table-bordered">'+
					  '<thead>'+
						'<tr>'+
						  '<th scope="col"></th>'+
						  '<th scope="col">Date</th>'+
						  '<th scope="col">Min Temperature</th>'+
						  '<th scope="col">Max Temperature</th>'+
						'</tr>'+
					  '</thead>'+
					  '<tbody>';
			let days=weatherInfos.daily.time;
			let maxTemps=weatherInfos.daily.temperature_2m_max;
			let minTemps=weatherInfos.daily.temperature_2m_min;

			let weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
			
			days.forEach((date, index) => {
				let dayName=weekday[new Date(date).getDay()];
				let htmlSegment = '<tr>'+
						  '<th scope="row">'+dayName+'</th>'+
						  '<td>'+date+'</td>'+
						  '<td>'+maxTemps[index]+' ℃</td>'+
						  '<td>'+minTemps[index]+' ℃</td>'+
						'</tr>';
						
				html += htmlSegment;
			});
			html +='</tbody></table>';
			document.getElementById("alert").innerHTML ="";
			let result=document.getElementById("weatherInfos");
			result.innerHTML = html;
		}catch (error) {
			alertMessage("An error Occurred");
			document.getElementById("weatherInfos").innerHTML="";			
		}
	}
}
