var inicio, partida, resultado;
var nivel_sel,grados,opacidad_r;
var tiempos = [[35,50],[70,100],[120,180]];

function body_onload(){
	inicio = new Portada();
	resultado = document.getElementById("pantalla_resultado");
}

function nivel_onmouseover(nivel){
	if(!inicio.seleccion){
		inicio.div_saludo.style.top = (nivel.offsetTop - 330)+"px";
	}
}

function nivel_onclick(nivel){
	var jugador = inicio.input_nombre.value;

	if(jugador != ""){
		nivel_sel = nivel;
		inicio.seleccion = true;
		partida = new Partida(jugador,nivel);
		desvanece_inicio();
	}
	else alert("No se ha introducido el nombre de jugador!");
}

function cartasf_onclick(carta,i,j){
	if(partida.matriz[i][j]!=-1){
		if(!partida.intento){
			grados = 0;
			partida.intento = new Intento(carta,i,j);
			abre_carta();
		}
		else if(!partida.intento.abriendo && !partida.intento.cerrando){
			grados = 0;
			partida.intento.completa(carta,i,j);
			abre_carta();
		}
	}
}

function regreso_onclick(){
	resultado.style.visibility = "hidden";
	opacidad_r = 0;
	partida = new Partida(partida.jugador,nivel_sel);
	aparece_partida();
}

function desvanece_inicio(){
	var pantalla = inicio.pantalla;

	if(pantalla.style.opacity>=0){
		pantalla.style.opacity = (pantalla.style.opacity-.01);
		setTimeout("desvanece_inicio()",5);
	}
	else{
		pantalla.style.visibility = "hidden";
		partida.pantalla.style.visibility = "visible";
		aparece_partida();
	}
}

function aparece_partida(){
	var pantalla = partida.pantalla;

	if(partida.opacidad<=1){
		partida.opacidad = partida.opacidad + .01;
		pantalla.style.opacity = partida.opacidad;
		setTimeout("aparece_partida()",10);
	}
	else{
		actualiza_crono();
		partida.reparte();
	}
}

function actualiza_crono(){
	if(!partida.fin){
		partida.aumenta_tiempo();

		if(partida.minutos<60) setTimeout('actualiza_crono()',1000);
		else partida.crono.innerHTML = "00:00";
	}
}

function abre_carta(){
	if(grados<180){
		grados+=2;
		partida.intento.carta_actual.style.transform = "rotate3d(0,1,0,"+ grados +"deg)";
		setTimeout("abre_carta()",5);
	}
	else{
		partida.intento.abriendo = false;
		if(partida.intento.carta2 != undefined){
			partida.n_intentos++;
			if(partida.intento.compara(partida.matriz)){
				partida.n_pares++;
				if(partida.n_pares == ((partida.n_renglones*partida.n_columnas)/2))
				{
					partida.fin = true;
					alert("La partida ha terminado!\n\nPares: "+partida.n_pares+"\n"+
						  "Intentos: "+partida.n_intentos+"\n"+
						  "Tiempo: "+partida.verifica_tiempo(partida.minutos)+":"+
							    	+partida.verifica_tiempo(partida.segundos));
					inicializa_resultado();
					aparece_resultado();
				}
				partida.intento = null;
			}
			else{
				grados = 180;
				partida.intento.cerrando = true;
				setTimeout("cierra_cartas()",700);
			}
		}
	}
}

function cierra_cartas(){
	if(grados>0){
		grados-=2;
		partida.intento.primera_carta.style.transform = "rotate3d(0,1,0,"+ grados +"deg)";
		partida.intento.carta_actual.style.transform = "rotate3d(0,1,0,"+ grados +"deg)";
		setTimeout("cierra_cartas()",5);
	}
	else partida.intento = null;
}

function inicializa_resultado(){
	var etiqueta = 0;
	var descripcion = "";
	var tab_tiempo = tiempos[0];

	opacidad_r = 0;
	resultado.style.visibility = "visible";
	document.getElementById("nombre").innerHTML = partida.jugador;


	if(nivel_sel.id=="normal") tab_tiempo = tiempos[1];
	else if(nivel_sel.id=="mounstro") tab_tiempo = tiempos[2];

	switch(evalua_desempeno(tab_tiempo)){
		case 0:
			etiqueta = 20;
			descripcion = "Eres de esas personas que no recuerda "+
						  "ni que desayuno.<br/><br>!!!Te olvidas "+
						  "hasta de tu cumpleaños!!!";
		break;
		case 1:
			etiqueta = 18;
			descripcion = "Ni te emociones no tienes nada de especial."+
						  "<br/><br/>!!!Eres de los que estudias antes "+
						  "de los exámenes, haber si se te pega algo, WOW!!!";
		break;
		case 2:
			etiqueta = 19;
			descripcion = "Nunca olvidas nada, eres de esas personas "+
						  "que odia a todo el mundo.<br/><br/>"+
						  "!!!RELAJATE!!!";
		break;
	}
	
	document.getElementById("etiqueta_resultado").style.backgroundImage = "url('Imágenes/resultado/result-"+etiqueta+".png')";
	document.getElementById("descripcion").innerHTML = descripcion;
}

function evalua_desempeno(tab_tiempo){
	var t = (partida.minutos*60) + partida.segundos;
	var r = 0;

	if(t<=tab_tiempo[0]) r = 2;
	else if(tab_tiempo[0]<t && t<=tab_tiempo[1]) r = 1;

	return r;
}

function aparece_resultado(){
	if(opacidad_r<1){
		opacidad_r += .01;
		resultado.style.opacity = opacidad_r;
		setTimeout("aparece_resultado()",10);
	}
}

/*Clases*/

function Portada(){
	this.pantalla = document.getElementById("pantalla_inicio");
	this.div_saludo = document.getElementById("saludo");
	this.input_nombre = document.getElementById("input_nombre");
	this.seleccion = false;

	this.div_saludo.style.top = "110px";
	this.pantalla.style.opacity = 1;
	this.pantalla.style.visibility = "visible";
}

function Partida(jugador,nivel){
	this.pantalla = document.getElementById("pantalla_partida");
	this.tablero = document.getElementById("tablero");
	this.crono = document.getElementById("crono");
	this.jugador = jugador;
	this.minutos = 0;
	this.segundos = 0;
	this.fin = false;
	this.opacidad = 0;
	this.nivel = "Fácil";
	this.n_columnas = 4;
	this.n_renglones = 3;
	this.matriz;
	this.intento = null;
	this.n_intentos = 0;
	this.n_pares = 0;

	this.pantalla.style.opacity = 0;
	this.tablero.innerHTML = "";
	this.crono.innerHTML = "00:00";
	document.getElementById("jugador").innerHTML = jugador;

	switch(nivel.id){
		case "normal":
			this.nivel = "Normal";
		break;
		case "mounstro":
			this.nivel = "Mounstro";
			this.n_renglones = 4;
		break;
	}

	document.getElementById("nivel").innerHTML = this.nivel;

	if(nivel.id == "facil"){
		this.tablero.style.width = "1015px";
		this.tablero.style.height = "906px";
		this.tablero.style.backgroundImage = "url('Imágenes/cartas facil/memo-36.png')";
	}
	else{
		this.tablero.style.width = "1123px";
		this.tablero.style.height = "1003px";
		this.tablero.style.backgroundImage = "url('Imágenes/cartas normal/memo-15.png')";
		this.n_columnas = 6;
	}

	this.tablero.style.marginLeft = "-"+(this.tablero.offsetWidth/2)+"px";
	this.tablero.style.marginTop = "-"+(this.tablero.offsetHeight/2)+"px";

	this.aumenta_tiempo = function(){
		this.segundos += 1;
		if(this.segundos == 60){
			this.segundos = 0;
			this.minutos += 1;
			if(this.minutos == 60){
				this.minutos = 0;
			}
		}
		
		this.crono.innerHTML = this.verifica_tiempo(this.minutos)+":"
							   +this.verifica_tiempo(this.segundos);
	};

	this.verifica_tiempo = function(t){
		if(t < 10){ t = "0" + t; }
		return t;
	};

	this.reparte = function(){
		var pares = (this.n_renglones*this.n_columnas)/2;
		var contador = new Array(pares);
		var aleatorio;

		this.matriz = new Array(this.n_renglones);
		for (i = 0;i < this.n_renglones;i++) this.matriz[i] = new Array(this.n_columnas);
		for(i = 0;i < contador.length;i++) contador[i] = 0;

		for(i = 0;i < this.n_renglones;i++){
			for(j=0;j < this.n_columnas;j++){
				while(this.matriz[i][j] == undefined){
					aleatorio = Math.floor(Math.random() * pares);
					if(contador[aleatorio]<2){
						this.matriz[i][j] = aleatorio+1;
						contador[aleatorio] += 1;
					}
				}
			}
		}

		this.carga_cartas();
	};

	this.carga_cartas = function(){
		var cartas;
		var tipo = 1;
		var espaciado = 40;
		var pos_y = 40;
		var dir = "cartas facil";

		if(this.nivel!="Fácil"){
			tipo = 2;
			espaciado = 25;
			dir = "cartas normal";

			if(this.nivel == "Normal") pos_y = 180;
			else pos_y = 80;
		}

		cartas = "<table id=\"tabla_cartas\""+
				 "style=\"border-spacing:"+espaciado+"px;"+
				 "margin-top:"+pos_y+"px;\">\n";

		for(i = 0;i < this.n_renglones;i++){
			cartas += "\t<tr>\n";
			for(j=0;j < this.n_columnas;j++){
				cartas += "\t\t<td>\n"+
						  "\t\t\t<div class=\"carta_frente"+tipo+"\""+
						  "style=\"background-image:url('Imágenes/"+dir+"/"+this.matriz[i][j]+".png');\""+
						  "onclick=\"cartasf_onclick(this,"+i+","+j+")\">\n"+
						  "\t\t\t\t<div class=\"carta_atras"+tipo+"\">"+
						  "\t\t\t\t</div>\n"+
						  "\t\t\t</div>\n"+
						  "\t\t</td>\n";
			}
			cartas += "\t</tr>\n";
		}

		cartas += "</table>";

		this.tablero.innerHTML = cartas;
	};
}

function Intento(primera_carta,i,j){
	this.primera_carta = primera_carta;
	this.carta_actual = primera_carta;
	this.carta1 = [i,j];
	this.carta2 = undefined;
	this.abriendo = true;
	this.cerrando = false;

	this.completa = function(segunda_carta,i2,j2){
		this.carta_actual = segunda_carta;
		this.carta2 = [i2,j2];
		this.abriendo = true;
	};

	this.compara = function(matriz){
		var resultado = false;

		if(matriz[this.carta1[0]][this.carta1[1]]==matriz[this.carta2[0]][this.carta2[1]]){
			matriz[this.carta1[0]][this.carta1[1]]=-1;
			matriz[this.carta2[0]][this.carta2[1]]=-1;
			resultado = true;
		}

		return resultado;
	};
}
