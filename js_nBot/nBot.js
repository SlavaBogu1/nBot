// Re-build the game
// Re-build the game
// Define GLOBAL objects for the game

// This object to store all node coordinates (x,y values) plus some extra info (like visibility)
	var Layouts = {
		header  :{game_title:{x:0,y:0},score:{x:0,y:0},art:{x:0,y:0}}, // each record represent x and y coordinates
		patterns:{first:{visible:true,x:[],y:[]},second:{visible:false,x:[],y:[]},third:{visible:false,x:[],y:[]},fours:{visible:false,x:[],y:[]}}, //four pattern arrays
		board   :{x:[],y:[]},
		footer  :{x:[],y:[]}
	};
	
	var template_gears = [];
	
	//samples
	//Coordinates.header.game_title.x = 100;
	//Coordinates.header.game_title["y"] = Coordinates.header.game_title.x;
	//Coordinates.patterns.first.x[0] = 100;
	//Coordinates.patterns["first"].y[0] = 200;
	//Coordinates.patterns.first.x[1] = 300;
	//Coordinates.patterns.first.y[1] = 400;


	
//-----------------------------------------------------OLD CODE
	var mobile_screen_sizes = [
		["720", "480","1080","980", "540","320","768", "480","750", "360","240","640", "640","240","800", "1440"],
		["1280","800","1920","1675","960","480","1280","854","1334","640","320","1136","960","400","1280","2560"]
	]; // just as reerence in order of popularity

	var CellsInField, CellsInPattern, CellsPerPattern;
	var MaxFieldColor, MaxPatternColor;
	var colors_arr = [];
	var color_patterns = [];
	var rec_colors = [
		["00","00","FF","00","FF","FF","FF","22","00","88"],
		["00","FF","00","FF","FF","00","FF","88","22","00"],
		["FF","00","00","FF","00","FF","FF","00","88","22"]
	];
	
	var level = 0; //начальный уровень
	if (level > 9 || level < 0 ) {level = 0;}

	
	/* level_cfg - в зависимости от уровня задаем разное количество клеток и цветов
	level 0:  поле 6*6, 4 цвета
	level 1:  поле 6*6, 5 цветов
	level 2:  поле 8*8, 4 цвета
	level 3:  поле 8*8, 5 цветов
	..
	*/	
	var level_cfg = [[6,4],[6,5],[8,4],[8,5],[8,6],[10,4],[10,5],[10,6],[10,7],[10,8],[12,4],[12,5],[12,6],[12,7],[12,8],[12,9],[12,10]];
	/*game board settings*/
	CellsInField = level_cfg[level][0];
	MaxFieldColor = level_cfg[level][1];

	/* pattern_cfg - в зависимости от уровня задаем разные типы шаблонов
	   level 0: simple(1) , 2 color, 2 options
	   level 0: simple(1) , 3 color, 2 options
	   ...
	*/
	var pattern_cfg = [[0,2,3],[0,3,3],[1,2,3],[1,3,3],[2,3,4],[2,4,4],[2,4,4],[3,5,5],[3,5,5],[3,6,5]]; //TBD
	
	/*template settings*/
	CellsInPattern = pattern_cfg[level][2]; // size of template square
	MaxPatternColor = pattern_cfg[level][1];
	template_layout_type = "+"; // default template type is cross
	
	/*В зависимости от сложности шаблона задать сколько будет клеток в нем и какой формы*/
	switch(pattern_cfg[level][0]){
		case 0:
			CellsPerPattern = 3; // number of non-empty cells in template
			template_layout_type = "T";
			break;
		case 1:
			CellsPerPattern = 3;
			template_layout_type = "O";
			break;
		case 2:
			CellsPerPattern = 4;	
			template_layout_type = "L";
			break;
		default:
			CellsPerPattern = 5;
			template_layout_type = "+";
			break;
	}
	
	function FillInTheTable(){
		var i,j,k,p;
		var pattern_palete = []; //палитра цветов шаблона - случайно выбранные несколько цветов из максимального диапазона
		
		for (i=0;i<CellsInField;i++){
			colors_arr[i] = [];
			for (j=0;j<CellsInField;j++){
				colors_arr[i][j] = Math.floor((Math.random() * MaxFieldColor));
			}
		}
		
		// заполним палитру
		for (i=0;i<MaxPatternColor;i++){
			pattern_palete[i] =  Math.floor((Math.random() * MaxFieldColor));
		}
		p = 0;
		for (i=0;i<level_layout.cells_per_template;i++){
			color_patterns[i] = [];
			for (j=0;j<CellsPerPattern;j++){
				color_patterns[i][j] = [];
				for (k=0;k<CellsPerPattern;k++){
					color_patterns[i][j][k] = pattern_palete[p++];
					if (p>=MaxPatternColor) { p = 0; }
				}
			}
		}
	}
	
	function DrawRectRGB(x,y,w,h,r,g,b){
		hexString = "#" + r + g + b;
		ctx.beginPath();
		ctx.fillStyle=hexString;
		ctx.fillRect(x,y,w,h);
		ctx.closePath();	
	}

	//use color string
	function DrawRect(x,y,s,h,c){
		ctx.beginPath();
		ctx.fillStyle=c;
		ctx.fillRect(x,y,s,h);
		ctx.closePath();
	}
	
	
	function GetCanvasWidth(win_w,canv_w){
		if (canv_w  < win_w) {
			return win_w;
		}	
		return canv_w;
	}
	function GetCanvasHeight(win_h,canv_h){
		if (canv_h  < win_h) {
			return win_h;
		}	
		return canv_h;
	}

	var template_image;

	// format number less than 10 with lead zero ( 01,02 ..)
	function pad(n) {
		return (n < 10) ? ("0" + n) : n;
	}
	
	function getZeroNum(zcnt,num) {
	  var temp=""+num;
	  while(temp.length<zcnt)temp="0"+temp;
	  return temp;
	}
	
	
	var screen_layout = {main_field_x0:0, main_field_y0:0, main_field_width:0, main_field_padding:5, templ_field_x0:0, temp_field_y0:0, templ_field_width:48, templ_field_padding:30,
						adv_field_x0:0, adv_field_y0:0, adv_field_width:0, adv_field_height:100, score_field_x0:0, score_field_y0:0, score_field_width:0};
	var color_palette = {background:"#1183a5", color_light:"#9ce5fb", color_30:"#5dd7fb", color_60:"#26bbe7", color_90:"#27a6cc"};
	var level_layout = {cells_per_field:CellsInField, cells_per_template:CellsInPattern};
    var gears_30 = []; //array to keep the list of 30 gears.
	var gears_xy;
	var templates_xy;
	var MAGIC_BIG;
	var MAGIC_SMALL = screen_layout.templ_field_width -4;
		
	var canvas_width;

	function DrawMainField(w,h,lvl){
		var i,j,k;
		
		canvas_width = w;
		//solid background
		DrawRect(0,0,w,h,color_palette.background);
		
		// main filed square mesh
		screen_layout.main_field_x0 = screen_layout.main_field_padding;
		screen_layout.main_field_y0 = h - w - screen_layout.adv_field_height; 
		if (screen_layout.main_field_width == 0) { //if width set to 0 it mean AUTODETECT.
			screen_layout.main_field_width = Math.round((w - 2*screen_layout.main_field_padding ) / level_layout.cells_per_field);
			MAGIC_BIG = screen_layout.main_field_width - 4;
		}
		DrawSquares(screen_layout.main_field_x0,screen_layout.main_field_y0,screen_layout.main_field_width,level_layout.cells_per_field,color_palette.color_light);

		// calculate x0,y0 coordinates for gears in the main field
		var x0,y0;
		gears_xy = new Array(level_layout.cells_per_field);
		for (i = 0; i < level_layout.cells_per_field; i++) {
			gears_xy[i] = new Array(level_layout.cells_per_field);
			for (j = 0; j < level_layout.cells_per_field; j++) {
				gears_xy[i][j] = new Array(2);
				// MAGIC - magic number: scale of the  gear.png 
				x0 = screen_layout.main_field_x0 + ((screen_layout.main_field_width - MAGIC_BIG) >> 1) + i * screen_layout.main_field_width;
				y0 = screen_layout.main_field_y0 + ((screen_layout.main_field_width - MAGIC_BIG) >> 1) + j * screen_layout.main_field_width;
				gears_xy[i][j][0] = x0;
				gears_xy[i][j][1] = y0;
			}
		}

		
		// Load gears into array
		var gear_id_name;
		for (i=0;i<30;i++){
			gear_id_name = "gear_64_" + pad(i+1);
			gears_30[i] = document.getElementById(gear_id_name);
		}
		
		//FillInBlueprintTemplate(level,template_gears,gears_30,30);
		
		k = 0;
		//var r,g,b;
		for (i=0;i<level_layout.cells_per_field;i++){
			for (j=0;j<level_layout.cells_per_field;j++){
				ctx.drawImage(gears_30[k++], gears_xy[i][j][0], gears_xy[i][j][1],MAGIC_BIG,MAGIC_BIG);
				//r = Math.floor((Math.random() * 256));
				//g = Math.floor((Math.random() * 256));
				//b = Math.floor((Math.random() * 256));
				//ChangeImageColor(gears_30[k-1],gears_xy[i][j][0], gears_xy[i][j][1],r,g,b);
				if (k==30) {
					k = 0;
				}
			}
		}


		// template fields square mesh
		screen_layout.templ_field_x0 = screen_layout.templ_field_padding;
		var template_width = level_layout.cells_per_template * screen_layout.templ_field_width;
		screen_layout.templ_field_y0 = screen_layout.main_field_y0 - screen_layout.templ_field_padding - template_width;
		DrawSquares(screen_layout.templ_field_x0,screen_layout.templ_field_y0,screen_layout.templ_field_width,level_layout.cells_per_template,color_palette.color_light);
		

		// calculate x0,y0 coordinates for gears in the main field
		templates_xy = new Array(level_layout.cells_per_template);
		for (i = 0; i < level_layout.cells_per_template; i++) {
			templates_xy[i] = new Array(level_layout.cells_per_template);
			for (j = 0; j < level_layout.cells_per_template; j++) {
				templates_xy[i][j] = new Array(2);
				// MAGIC_SMALL - magic number: size of gear.png files
				x0 = screen_layout.templ_field_x0 + ((screen_layout.templ_field_width - MAGIC_SMALL) >> 1) + i * screen_layout.templ_field_width;
				y0 = screen_layout.templ_field_y0 + ((screen_layout.templ_field_width - MAGIC_SMALL) >> 1) + j * screen_layout.templ_field_width;
				templates_xy[i][j][0] = x0;
				templates_xy[i][j][1] = y0;
			}
		}

		k = 0;
		for (i=0;i<level_layout.cells_per_template;i++){
			for (j=0;j<level_layout.cells_per_template;j++){
				ctx.drawImage(gears_30[k++], templates_xy[i][j][0], templates_xy[i][j][1],MAGIC_SMALL,MAGIC_SMALL);
				if (k==30) {
					k = 0;
				}
			}
		}
		
		// clone and rotate template for fist four levels ... probably should keep it later too.
		if ( level < 4){
			/*
			template_image = ctx.getImageData(screen_layout.templ_field_x0,screen_layout.templ_field_y0, template_width, template_width);
			var x_step = Math.round((w - 2* screen_layout.templ_field_padding - 4*template_width) /3 );
			var templ_x0 = screen_layout.templ_field_padding + template_width + x_step;
			ctx.putImageData(template_image, templ_x0, screen_layout.templ_field_y0);
			templ_x0 = templ_x0 + template_width + x_step;
			ctx.putImageData(template_image, templ_x0,screen_layout.templ_field_y0);
			templ_x0 = templ_x0 + template_width + x_step;
			ctx.putImageData(template_image, templ_x0,screen_layout.templ_field_y0);
			*/
			
		}

		// Top part of screen
		var gear_art = document.getElementById("gear_art");
		ctx.drawImage(gear_art, 10 , 10);
		
		ctx.font="30px Verdana";
		var name = "nanoBot maker";
		var name_w = ctx.measureText(name).width;
		var approx_text_height = ctx.measureText('M').width;
		x0 = (w >> 1) - (name_w >> 1);
		DrawRect(x0-2,50 - approx_text_height,name_w+4,approx_text_height + 4,color_palette.background);
		ctx.strokeText(name,x0,50);
		//var name = "____Bot maker";
		//ctx.fillText(name,x0,50);

		DrawScore(0);
	}
	
	function DrawScore(scores){
		var name = "SCORE: " + getZeroNum(6,scores);
		var name_w = ctx.measureText(name).width;
		var approx_text_height = ctx.measureText('M').width;
		
		x0 = canvas_width - name_w - 50;
		DrawRect(x0-2,120 - approx_text_height - 2,name_w+4,approx_text_height + 4,color_palette.background);
		ctx.fillStyle=color_palette.color_30;
		ctx.fillText(name,x0,120);
	}
	
	
	function ChangeImageColor(img,x,y,r,g,b){
		var c_w,c_h;
		c_w = img.width;
		c_h = img.height;

		var imgData=ctx.getImageData(x, y, c_w, c_h);

		var alpha = imgData.data[0];
		var beta;
		for (var i=0;i<imgData.data.length;i+=4) {
			beta = imgData.data[i];
			if (alpha != beta) {
				imgData.data[i]= r | imgData.data[i];
				imgData.data[i+1]= g | imgData.data[i+1];
				imgData.data[i+2]= b | imgData.data[i+2];
			}
		}
		ctx.putImageData(imgData,x,y);

	}
	
	
	function DrawSquares(x0,y0,cell_w,cells,col_line){
		var i,w,x1,x2,y1,y2;

		x1 = x0;
		x2 = x0;
		y1 = y0;
		y2 = y0;
		w = cell_w * cells;
		
		ctx.beginPath();
		ctx.strokeStyle = col_line;	
		for (i=0; i <= cells;i++){
			ctx.moveTo(x1, y1);
			ctx.lineTo(x1, y1+w);
			x1 = x1 + cell_w;			
			ctx.moveTo(x2, y2);
			ctx.lineTo(x2+w, y2);
			y2 = y2 + cell_w;			
		}
		ctx.stroke();
	}
	
	function MyCanvasClick (x,y){
		DrawScore(x); // debug purpose only - show that touch is working
		
	}
	
	function FillInBlueprintTemplate(lvl, tmplt,gears,max_count){
		var i;j;
		switch(template_layout_type){
			case "T":
				break;
			case "O":
				break;
			case "L":
				break;
			case "+":
			default:
				
				break;
		}
	}

	
	