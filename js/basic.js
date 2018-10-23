
function getContrast50(hexcolor){
    return (parseInt(hexcolor, 16) > 0xffffff/2) ? 'black':'white';
};

function getContrastYIQ(hexcolor){
	var r = parseInt(hexcolor.substr(0,2),16);
	var g = parseInt(hexcolor.substr(2,2),16);
	var b = parseInt(hexcolor.substr(4,2),16);
	var yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? 'black' : 'white';
};

var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase()
};

var getJSON = function(url, callback) {
	    	var xhr = new XMLHttpRequest();
	    	xhr.open('GET', url, true);
	    	xhr.responseType = 'json';
	    	xhr.onload = function() {
		      	var status = xhr.status;
		      	if (status === 200) {
		        	callback(null, xhr.response);
		        	//console.log("Ok");
		      	} else {
		        	callback(status, xhr.response);
		        	//console.log("NoK");
		      	}
	    	};
	    	xhr.send();
		};

class ECalendar{
	constructor(name, color, priority, price, dStart, dEnd, hStart, hEnd, recurrence){
		this._name = name || "No name";
		this._color = color || "black";
		this._priority = priority || 6;
		this._price = price || 52.5;
		/*TODO:Revisar*/
		this._dStart = dStart ? new Date(dStart) : !1;
		this._dEnd = dEnd ? new Date(dEnd) : !1;
		this._hStart = hStart || !1;
		this._hEnd = hEnd || !1;
		this._recurrence = recurrence || !1;
	}

	set recurrence(recurrence){
		this._recurrence.con = recurrence[0];
		this._recurrence.day = recurrence[1];
	}
	concurrence(eDate){
		let x = !1;
		if (!(eDate instanceof Date))
			eDate = new Date(eDate);
		if(eDate.getTime()==this._dStart.getTime()){
			x = !0;	
		}

		if(eDate>=this._dStart && this._recurrence){
			if((this._recurrence ? this._recurrence.day.includes(eDate.getDay()) : false)){
				x =!0;	
			}
		}
		return x ? {name: this._name ,color: this._color ,price: this._price, priority: this._priority, start: this._hStart, end: this._hEnd } : false;
	}
}


function Calendars(){
	this._items =[];
};

Calendars.prototype.add = function(item){
	this._items.push(item);
};
Calendars.prototype.get = function(){
	return this._items;
};
Calendars.prototype.set = function(items){
	this._items = items;
};
Calendars.prototype.getClass = function(date){
	let item=!1;
	for(let i=0; i<this._items.length; i++){
		let actual = this._items[i].concurrence(date);
		/*if(!item || parseInt(item.priority) >= parseInt(actual.priority)){
			item = actual;
		}*/
		if(!item){
			item = actual;
		}
		else{
			if(item.priority >= actual.priority){
				item = actual;
			}
		}
	}
	return item;
};

Calendars.prototype.getTime = function(date){
	let items=[];
	for(let i=0; i<this._items.length; i++){ 
		let actual = this._items[i].concurrence(date)
		if(actual && actual.start){
			items.push(actual);
		}
	}
	return items;
};

Calendars.prototype.getStatus = function(){
	return this._items.length>0;
};

function getCalendar(calendarId,timeMin){
	const promise = new Promise(function (resolve, reject){
				getJSON('https://www.googleapis.com/calendar/v3/calendars/'+calendarId+'/events?timeMin='+timeMin+'T00:00:00.000Z&key=AIzaSyDArEoGcMKwiwTBJN5hDXFIbPhitMcBZIc',
					function(err, data) {							
  						if (err !== null) {
    						reject(alert('Something went wrong: ' + err));
  						}
	  					else{
							var calendari = [];
    						//var d = new Date();    					
							for(var i=0; i < data.items.length; i++){
								let eLlista = document.createElement('li');
								let texte = document.createElement('p');
							
								/*Event*/
								let item = data.items[i];
								var dateTime = [];
								dateTime.all = item.start.date || item.start.dateTime;
								dateTime.date = dateTime.all.slice(0,10);
								dateTime.hora = dateTime.all.slice(11,19);
								dateTime.zone = dateTime.all.slice(19,25);
								dateTime.all = item.end.date || item.end.dateTime;
								dateTime.dateEnd = dateTime.all.slice(0,10);
								dateTime.horaEnd = dateTime.all.slice(11,19);
								
								let caract = item.description.split(",");
								let recurrenceFinal=[];
								if(item.recurrence){
									let recurrence = item.recurrence[0].split(";");
									recurrenceFinal.when=((recurrence[0].split(":"))[1].split("="))[1];
									days = recurrence[1].split("=")[1].split(",");
									/*Passar dies a nombre*/
									days.forEach(function(element, index){
										switch (element){
											case 'SU':
												days[index] = 0;
												break;
											case 'MO':
												days[index] = 1;
												break;
											case 'TU':
												days[index] = 2;
												break;
											case 'WE':
												days[index] = 3;
												break;
											case 'TH':
												days[index] = 4;
												break;
											case 'FR':
												days[index] = 5;
												break;
											case 'SA':
												days[index] = 6;
												break;
											default:
												console.log(";)");
										}
									});
									recurrenceFinal["day"]=days;
								}
								else{
									!0;
								}
							recurrenceFinal = recurrenceFinal.when ? recurrenceFinal : !1;
							let eventCalendar = new ECalendar(item.summary,caract[0],caract[1],caract[2],dateTime.date, dateTime.dateEnd, dateTime.hora, dateTime.horaEnd, recurrenceFinal);
							calendari.push(eventCalendar);
						}		
  						resolve(calendari);
  					}
				});
    		});
	return promise;
};


jQuery.fn.extend({
  pintar: function(calendari) {
    return this.each(function() {
      let mil = $(this).attr("data-pick");
     //ToDo: Repassar 7200000 dos hores 
    //$(this).css("background-color", (calendari.getClass(new Date(parseInt(mil)).getUTCDate()).color));
    let utc = mil<1540602000000 ? 7200000 : 3600000
    $(this).css("background-color", (calendari.getClass(new Date(parseInt(mil)+utc)).color));
	

    })
  },
  pintarReserva: function(calendari){
  	return this.each(function(){
  		let mil = $(this).attr("data-pick");
  		let utc = mil<1540602000000 ? 7200000 : 3600000;
  		let items = calendari.getTime(new Date(parseInt(mil)+utc));
  		$(this).find('tbody').remove();
	  	if(items.length>0){
	  		let element = document.createElement('thead');
	  		element.innerHTML=$(this).text();
	  		$(this).text("");
	  		element.style.fontSize = '66%';
	  		element.style.textAlign = 'right';
	  		$(this).append('<table>')
	  		$(this).find('table').append(element).append('<tbody>');
	  		if(items.length>2){
	  			let tr = document.createElement("tr");
	  			tr.innerHTML = "R";
	  			tr.style.backgroundColor = '#ff0015';
	  			tr.style.color = getContrastYIQ('#ff0015');
	  			$(this).find('tbody').append(tr);
	  			$(this).addClass('picker__day--disabled');
	  		}
	  		else{
	  			for(let i=0; i<items.length;i++){
	  				let tr = document.createElement("tr");
	  				tr.innerHTML = items[i].name;
	  				tr.style.fontSize = '66%';
	  				tr.style.backgroundColor = items[i].color;
	  				tr.style.color = getContrastYIQ(items[i].color);
	  				$(this).find('tbody').append(tr);
	  			}
	  		}
  		}
  	})
  }
});

/*Mostrar datapicker tarifes*/
function showCalendar(calendari){
	var $input = $('#bCalendar').pickadate({
										firstDay: 1});
	var picker = $input.pickadate('picker');
	picker.set('disable', true);
	let init = function(){
					$(".picker__footer").children().remove();
					$(".picker__day--highlighted").removeClass("picker__day--highlighted");
					var nom=[];
					for(let i=0; i<calendari._items.length;i++){
						if(!(nom.includes(calendari._items[i]._name.toString()))){
							let p=document.createElement('p');
							p.innerHTML= calendari._items[i]._name;
							p.style.color =  getContrastYIQ((calendari._items[i]._color).substring(1));
							p.style.backgroundColor= calendari._items[i]._color; 
							$(".picker__footer").append(p);
							nom.push(calendari._items[i]._name.toString());
						}
					}
			};
	picker.on({
			  open: function() {
				    init();				    
				   // console.log($("div[id=bCalendar_root] div.picker__day"));//.children(".picker__day"));
				    $("div[id=bCalendar_root] div.picker__day").pintar(calendari);
				    //$(".picker__day").pintar(calendari);
				  },
			  close: function() {

				  },
			  render: function() {
				   	init();
				   	$("div[id=bCalendar_root] div.picker__day").pintar(calendari);
				   //	$("#bCalendar").find("picker__day").pintar(calendari);				   	
				  },
			  stop: function() {
				  },
			  set: function(thingSet) {
				  }
			});
	
	//picker.open();
};

/*Mostrar DataPicker Reserva */
function showReserva(calendari){
	var $input = $('#validationDate').pickadate({
										firstDay: 1,
										min: new Date()});
	var picker = $input.pickadate('picker');
	let init = function(){
					$(".picker__footer").children().remove();
			};
	picker.on({
			  open: function() {
				    init();
				    $("div[id=validationDate_root] div.picker__day").pintarReserva(calendari, picker);
				    //$(".picker__day").pintarReserva(calendari, picker);
				  },
			  close: function() {
			  		let horaris = ['Matí','Tarda','Nit'];
			  		let items =  calendari.getTime($('input[name="date_submit"]').val().split('/').join('-'));
				    $('#validationHorari').children().remove();
				    let element = document.createElement('option');
				    element.innerHTML='Obrir per seleccionar Horari';
				    $('#validationHorari').append(element);
				    for(let i=0; i<items.length; i++){
				    	horaris.splice(horaris.indexOf(items[i].name),1);
				    }
				    for(let i=0; i<horaris.length; i++){
				    	let element = document.createElement('option');
				    	element.value=horaris[i];
				    	element.innerHTML=horaris[i];
				    	$('#validationHorari').append(element);
				    }
				    if ( items.length==0){
				    	let element = document.createElement('option');
				    	element.value="Tot el dia";
				    	element.innerHTML="Tot el dia";
				    	$('#validationHorari').append(element);
				    }

				    if($('input[name="date_submit"]').val()==""){
				    	$('#validationHorari').prop("disabled", true);
				    }else{
				    	$('#validationHorari').prop("disabled", false);	
				    }
				  },
			  render: function() {
				   	init();
				   	$("div[id=validationDate_root] div.picker__day").pintarReserva(calendari, picker);
				   	//$(".picker__day").pintarReserva(calendari, picker);
				  },
			  stop: function() {
				  },
			  set: function(thingSet) {
				  }
			});
};   		