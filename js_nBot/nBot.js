// Re-build the game
// Re-build the game
// Define GLOBAL objects for the game

    var ctx;
// This object to store all node coordinates (x,y values) plus some extra info (like visibility)
	var game_layouts = {
	// PROPERTIES	
		header_xy  :{game_title:{x:0,y:0},score:{x:0,y:0},art:{x:0,y:0}}, // each record represent x and y coordinates
		patterns:{first:{visible:true,x:[],y:[]},second:{visible:false,x:[],y:[]},third:{visible:false,x:[],y:[]},fours:{visible:false,x:[],y:[]}}, //four pattern arrays
		number_of_cells : 0,
		board_cell_width : 0,
		board_width_divider : 1,  // 1/board_cell_width
		template_cell_width : 48,
		template_width_divider : 1,
		cells_on_board :0,
		cells_per_template : 0,
		board_grid_nodes :{x:[],y:[]}, // top-left coordinates of cell
		gear_nodes :{x:[], y:[]}, //top-left coordinates of gear image in the cell
		gears :{id:[]}, //list of gears to display. ID is the index in the gears_30 array
		selected_node:{x:-1,y:-1},
		footer :{footer_xy:{x:0,y:0}, footer_height:100}, //top-left coordinates of footer frame
	// METHODS
		test : function() { return 42; }
	};
	//samples
	//game_layouts.header_xy.game_title.x = 100;
	//game_layouts.header_xy.game_title["y"] = game_layouts.header.game_title.x;
	//game_layouts.patterns.first.x[0] = 100;
	//game_layouts.patterns["first"].y[0] = 200;
	//game_layouts.patterns.first.x[1] = 300;
	//game_layouts.patterns.first.y[1] = 400;
	
	var grid_coordinates = {x:0, y:0};
	
	var template_gears = [];
	
	var level = 0; //начальный уровень
	if (level > 9 || level < 0 ) {level = 0;}

	var color_palette = {background:"#1183a5", color_light:"#9ce5fb", color_30:"#5dd7fb", color_60:"#26bbe7", color_90:"#27a6cc"};
	
	/* level_cfg - в зависимости от уровня задаем разное количество клеток и цветов
	level 0:  поле 6*6, 4 цвета
	level 1:  поле 6*6, 5 цветов
	level 2:  поле 8*8, 4 цвета
	level 3:  поле 8*8, 5 цветов
	..
	*/	
	var level_cfg = [[6,4],[6,5],[8,4],[8,5],[8,6],[10,4],[10,5],[10,6],[10,7],[10,8],[12,4],[12,5],[12,6],[12,7],[12,8],[12,9],[12,10]];
	
	// compatibility .. TO_DELETE
	var screen_layout = { main_field_padding:5, templ_field_x0:0, temp_field_y0:0, templ_field_padding:30};
	// compatibility .. TO_DELETE
	
	
	// input: canvas width and canvas height
	// result: update global object: game_layouts
	function CalculateLayouts(w,h){
		var board_padding = 5;
		var art_x_padding = 10;
		var art_y_padding = 10;
		var title_y_padding = 50;
		var i,j;

		game_layouts.header_xy.art.x = art_x_padding; // background art horizontal offset 
		game_layouts.header_xy.art.y = art_y_padding; // background art vertical offset
		game_layouts.header_xy.game_title.x = (w >> 1); // basis to draw title in the middle of screen
		game_layouts.header_xy.game_title.y = title_y_padding; // title vertical offset
		
		game_layouts.board_grid_nodes.x[0] = board_padding; // x-coordinate of node to draw the cell border
		game_layouts.board_grid_nodes.y[0] = h - w - game_layouts.footer.footer_height; // y-coordinate of node to draw the cell border

		game_layouts.board_cell_width = Math.round((w - 2*game_layouts.board_grid_nodes.x[0] ) / game_layouts.cells_on_board);
		game_layouts.board_width_divider = 1 / game_layouts.board_cell_width;
		game_layouts.template_width_divider = 1 / game_layouts.template_cell_width;

		var offset = (game_layouts.board_cell_width - MAGIC_BIG) >> 1;
		MAGIC_BIG = game_layouts.board_cell_width - 14;

		for (i = 0; i < game_layouts.cells_on_board; i++) {
			var increase = i * game_layouts.board_cell_width;
			/*game_layouts.gear_nodes.x[i] = game_layouts.board_grid_nodes.x[0] + offset + increase;
			game_layouts.gear_nodes.y[i] = game_layouts.board_grid_nodes.y[0] + offset + increase;*/			
			game_layouts.board_grid_nodes.x[i] = game_layouts.board_grid_nodes.x[0] + increase;
			game_layouts.board_grid_nodes.y[i] = game_layouts.board_grid_nodes.y[0] + increase;
		}
		
		game_layouts.gear_nodes.x[0] = game_layouts.board_grid_nodes.x[0] + 5;
		game_layouts.gear_nodes.y[0] = game_layouts.board_grid_nodes.y[0] + 5;
		for (i=1;i<game_layouts.cells_on_board;i++) {
			game_layouts.gear_nodes.x[i] = game_layouts.gear_nodes.x[i-1] + offset + game_layouts.board_cell_width; 
			game_layouts.gear_nodes.y[i] = game_layouts.gear_nodes.y[i-1] + offset + game_layouts.board_cell_width;
		}
		
		//game_layouts.gear_nodes.x[0] = game_layouts.board_grid_nodes.x[0] + 5; // x-coordinate of position inside the cell to draw the gear
		//game_layouts.gear_nodes.y[0] = 0; // x-coordinate of position inside the cell to draw the gear
		
	}
	
	
//-----------------------------------------------------OLD CODE
	var mobile_screen_sizes = [
		["720", "480","1080","980", "540","320","768", "480","750", "360","240","640", "640","240","800", "1440"],
		["1280","800","1920","1675","960","480","1280","854","1334","640","320","1136","960","400","1280","2560"]
	]; // just as reference in order of popularity

	var CellsPerPattern;
	var MaxFieldColor, MaxPatternColor;
	var colors_arr = [];
	var color_patterns = [];
	
	/*game board settings*/
	MaxFieldColor = level_cfg[level][1];

	/* pattern_cfg - в зависимости от уровня задаем разные типы шаблонов
	   level 0: simple(1) , 2 color, 2 options
	   level 0: simple(1) , 3 color, 2 options
	   ...
	*/
	var pattern_cfg = [[0,2,3],[0,3,3],[1,2,3],[1,3,3],[2,3,4],[2,4,4],[2,4,4],[3,5,5],[3,5,5],[3,6,5]]; //TBD
	
	/*template settings*/
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

	var NUM_OF_GEARS = 30;
    var gears_30 = []; //array to keep the list of 30 gears.
	var gears_xy;
	var templates_xy;
	var MAGIC_BIG;
	var MAGIC_SMALL;
	var template_image;
	var canvas_width;

	function InitArrays (){
		var i,j;
		var gear_id_name;
		
		// Load gears into array
		for (i=0;i<NUM_OF_GEARS;i++){
			gear_id_name = "gear_64_" + pad(i+1);
			gears_30[i] = document.getElementById(gear_id_name);
		}
		
		game_layouts.cells_on_board = level_cfg[level][0]; // number of cells in the main field
		game_layouts.cells_per_template = pattern_cfg[level][2]; // number of cells in the template

		
		for (i=0;i<game_layouts.cells_on_board;i++) {
			game_layouts.gears.id[i] = new Array(game_layouts.cells_on_board);
			game_layouts.gear_nodes[i] = new Array(game_layouts.cells_on_board);
			for (j=0; j<game_layouts.cells_on_board;j++){
				game_layouts.gears.id[i][j] = Math.floor((Math.random() * NUM_OF_GEARS)); 			
			}
		}
		
	}
	
	function DrawMainField(w,h,lvl){
		var i,j,k;
		
		canvas_width = w;
		//solid background
		DrawRect(0,0,w,h,color_palette.background);

		//
		MAGIC_SMALL = game_layouts.template_cell_width - 4;
		DrawSquares(game_layouts.board_grid_nodes.x[0],game_layouts.board_grid_nodes.y[0],game_layouts.board_cell_width,game_layouts.cells_on_board,color_palette.color_60);

		// calculate x0,y0 coordinates for gears in the main field
		var x0,y0;
		gears_xy = new Array(game_layouts.cells_on_board);
		for (i = 0; i < game_layouts.cells_on_board; i++) {
			gears_xy[i] = new Array(game_layouts.cells_on_board);
			for (j = 0; j < game_layouts.cells_on_board; j++) {
				gears_xy[i][j] = new Array(2);
				// MAGIC - magic number: scale of the  gear.png 
				x0 = game_layouts.board_grid_nodes.x[0] + ((game_layouts.board_cell_width - MAGIC_BIG) >> 1) + i * game_layouts.board_cell_width;
				y0 = game_layouts.board_grid_nodes.y[0] + ((game_layouts.board_cell_width - MAGIC_BIG) >> 1) + j * game_layouts.board_cell_width;
				gears_xy[i][j][0] = x0;
				gears_xy[i][j][1] = y0;
			}
		}

		k = 0;
		//var r,g,b;
		/*for (i=0;i<game_layouts.cells_on_board*game_layouts.cells_on_board;i++){
			//ctx.drawImage(gears_30[k++], gears_xy[i][j][0], gears_xy[i][j][1],MAGIC_BIG,MAGIC_BIG);
			ctx.drawImage(gears_30[k++], game_layouts.gear_nodes.x[i], game_layouts.gear_nodes.y[i],MAGIC_BIG,MAGIC_BIG);
			if (k===30) {
				k = 0;
			}
		}*/
		for (i=0;i<game_layouts.cells_on_board;i++) {
			for (j=0; j<game_layouts.cells_on_board;j++){
				ctx.drawImage(gears_30[game_layouts.gears.id[i][j]], game_layouts.gear_nodes.x[i], game_layouts.gear_nodes.y[j],MAGIC_BIG,MAGIC_BIG);
			}
		}

		// template fields square mesh
		screen_layout.templ_field_x0 = screen_layout.templ_field_padding;
		var template_width = game_layouts.cells_per_template * game_layouts.template_cell_width;
		screen_layout.templ_field_y0 = game_layouts.board_grid_nodes.y[0] - screen_layout.templ_field_padding - template_width;
		DrawSquares(screen_layout.templ_field_x0,screen_layout.templ_field_y0,game_layouts.template_cell_width,game_layouts.cells_per_template,color_palette.color_90);
		

		// calculate x0,y0 coordinates for gears in the main field
		templates_xy = new Array(game_layouts.cells_per_template);
		for (i = 0; i < game_layouts.cells_per_template; i++) {
			templates_xy[i] = new Array(game_layouts.cells_per_template);
			for (j = 0; j < game_layouts.cells_per_template; j++) {
				templates_xy[i][j] = new Array(2);
				// MAGIC_SMALL - magic number: size of gear.png files
				x0 = screen_layout.templ_field_x0 + ((game_layouts.template_cell_width - MAGIC_SMALL) >> 1) + i * game_layouts.template_cell_width;
				y0 = screen_layout.templ_field_y0 + ((game_layouts.template_cell_width - MAGIC_SMALL) >> 1) + j * game_layouts.template_cell_width;
				templates_xy[i][j][0] = x0;
				templates_xy[i][j][1] = y0;
			}
		}

		k = 0;
		for (i=0;i<game_layouts.cells_per_template;i++){
			for (j=0;j<game_layouts.cells_per_template;j++){
				ctx.drawImage(gears_30[k++], templates_xy[i][j][0], templates_xy[i][j][1],MAGIC_SMALL,MAGIC_SMALL);
				if (k===30) {
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

		DrawGameBoardTopArt();		
		DrawGameTitle("nanoBot maker");
		DrawScore(0);
	}

	function DrawGameBoardTopArt(){
		// Top part of screen
		var gear_art = document.getElementById("gear_art");
		ctx.drawImage(gear_art, game_layouts.header_xy.art.x , game_layouts.header_xy.art.y);
	}
	
	function DrawGameTitle(title){
		var name_w;
		var approx_text_height;
		
		ctx.font="30px Verdana";
		ctx.strokeStyle = color_palette.color_light;
		name_w = ctx.measureText(title).width;
		approx_text_height = ctx.measureText('M').width;
		
		x0 = game_layouts.header_xy.game_title.x - (name_w >> 1);
		y0 = game_layouts.header_xy.game_title.y;
		DrawRect(x0-2, y0 - approx_text_height,name_w+4,approx_text_height + 4,color_palette.background);
		ctx.strokeText(title,x0,y0);
	}
		
	function DrawScore(scores){
		var name_w;
		var approx_text_height;
		var name = "ENERGY: " + getZeroNum(6,scores);
		
		ctx.font="30px Verdana";
		name_w = ctx.measureText(name).width;
		approx_text_height = ctx.measureText('M').width;
		
		x0 = canvas_width - name_w - 50;
		DrawRect(x0-2,120 - approx_text_height - 2,name_w+4,approx_text_height + 4,color_palette.background);
		ctx.fillStyle=color_palette.color_30;
		ctx.fillText(name,x0,120);
	}
	
	function DrawUnderScore(ustext){
		var ustext_w = ctx.measureText(ustext).width;
		var approx_text_height = ctx.measureText('M').width;
		
		x0 = canvas_width - ustext_w - 50;
		DrawRect(x0-50,150 - approx_text_height - 2,ustext_w+54,approx_text_height + 14,color_palette.background);
		ctx.fillStyle = color_palette.color_30;
		ctx.fillText(ustext,x0,150);
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
			if (alpha !== beta) {
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
		ctx.closePath();
		ctx.stroke();
	}
	
	function PointerMovements (x,y,evnt){
		var cur;
		//DrawScore(x); // debug purpose only - show that touch is working
		GetGridCoordinates(x,y); // convert pinter coordinates into indexes in the grid
	
		switch(evnt){
			case"mousedown":
			//case"touchstart":
				//cur = document.body.style.cursor;
				document.body.style.cursor = "url('" + gears_30[0].src + "'),auto";				
				break;
			case"mouseup":
			//case"touchend":
				if (cur!=="") document.body.style.cursor = "";
				break;
			case"mousemove":
			case"touchmove":
				DrawUnderScore(evnt + " x: " + grid_coordinates.x + " y: " + grid_coordinates.y);
				break;
		}
		HighlightCell(grid_coordinates.x, grid_coordinates.y);
		
	}
	
	function HighlightCell(x,y){
		var w = game_layouts.board_cell_width;
		var cx,cy;
		ctx.lineWidth = 2;
		if (game_layouts.selected_node.x === x &&  game_layouts.selected_node.y === y) { 
			return; 
		}
	
		UnhighlightCell(game_layouts.selected_node.x,game_layouts.selected_node.y);

		ctx.beginPath();
		cx = game_layouts.board_grid_nodes.x[x];
		cy = game_layouts.board_grid_nodes.y[y];
		ctx.strokeStyle = color_palette.color_light;
		ctx.rect(cx,cy,w,w);
		ctx.closePath();
		ctx.stroke();		
		game_layouts.selected_node.x = x;
		game_layouts.selected_node.y = y;
	}
	
	function UnhighlightCell(x,y){
		var w = game_layouts.board_cell_width;
		var cx,cy;

		cx = game_layouts.board_grid_nodes.x[x];
		cy = game_layouts.board_grid_nodes.y[y];
	
		ctx.beginPath();
		//ctx.lineWidth = 2;
		ctx.strokeStyle = color_palette.color_90;
		ctx.rect(cx,cy,w,w);
		ctx.closePath();		
		ctx.stroke();		
	}

	function GetGridCoordinates(x,y) {
		var grid_x = Math.floor((x - game_layouts.board_grid_nodes.x[0] - canv_left)* game_layouts.board_width_divider);
		var grid_y = Math.floor((y - game_layouts.board_grid_nodes.y[0] - canv_top)* game_layouts.board_width_divider);
		if (grid_x < 0) grid_x = 0;
		if (grid_y < 0) grid_y = 0;
		if (grid_x >= game_layouts.cells_on_board) grid_x = game_layouts.cells_on_board - 1;
		if (grid_y >= game_layouts.cells_on_board) grid_y = game_layouts.cells_on_board - 1;
		grid_coordinates.x = grid_x;
		grid_coordinates.y = grid_y;
	}
		
	
	// format number less than 10 with lead zero ( 01,02 ..)
	function pad(n) {
		return (n < 10) ? ("0" + n) : n;
	}
	
	// add zeros before the number
	function getZeroNum(zcnt,num) {
	  var temp=""+num;
	  while(temp.length<zcnt)temp="0"+temp;
	  return temp;
	}

	// screen rotation ?
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

	function DrawRectRGB(x,y,w,h,r,g,b){
		hexString = "#" + r + g + b;
		сtx.beginPath();
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
