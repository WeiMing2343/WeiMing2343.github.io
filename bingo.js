
var bingoStart = 1;
var bingoEnd = 70;


function btnClick(){
	if(this.className == 'bingoBtn'){
		this.className = 'bingoBtn on';

		if(newCard)
			addNumber(this.value)
		else
			bingoBallSelect(this.value);
	}else{
		this.className = 'bingoBtn';

		if(newCard)
			removeNumber(this.value)
		else
			bingoBallUnSelect(this.value);
	}
}

function createBingoBall(){
	// Create and append totalCard text first if cards exist
	if (cards.length > 0 && bingoNumbersPanelDiv) {
		var totalCard = document.createElement('div');
		totalCard.className = 'totalCard'; // Add a class for potential styling
		totalCard.innerText = "卡片總數 " + cards.length + " 張，";
		if(cards.length <= 5)
			totalCard.innerText += "  買那麼少，你不會中。"
		else if(cards.length > 5 && cards.length < 10)
			totalCard.innerText += "  專心吃你的飯，你不會中。"
		else if(cards.length >= 10 && cards.length < 20)
			totalCard.innerText += "  唉唷 砸超過500，但你還是不會中。"
		else if(cards.length >= 20 && cards.length < 25)
			totalCard.innerText += "  嘖嘖 砸超過1000，謝謝你捐錢出來給大家花。"
		else
			totalCard.innerText += "  凱子。"
		bingoNumbersPanelDiv.appendChild(totalCard);
	}

	modeText = document.createElement('div'); // modeText is already declared globally, this might be an issue.
										  // Assuming it's intended to be a local var or re-assigned.
	if(!newCard){
		modeText.className = 'modeText red';
		modeText.innerText = "對獎模式";
	} else{
		modeText.className = 'modeText';
		modeText.innerText = "新增卡片";
	}
	// Ensure bingoNumbersPanelDiv is available before appending
	if (bingoNumbersPanelDiv) {
		bingoNumbersPanelDiv.appendChild(modeText);

		const bingoButtonsContainer = document.createElement('div');
		bingoButtonsContainer.className = 'bingo-buttons-container'; // Add a class for styling
		bingoNumbersPanelDiv.appendChild(bingoButtonsContainer);

		var itemPerLine = 5; // Changed to 5 items per line
		for(var i = bingoStart ; i <= bingoEnd ; i++) // Changed loop variable
		{
			 var obj = document.createElement('input');
			 obj.type = 'button';
			 obj.className = 'bingoBtn';
			 obj.value = i;
			 obj.onclick = btnClick;

			 bingoButtonsContainer.appendChild(obj);

			 if(i % itemPerLine == 0 && i !== bingoEnd) 
				bingoButtonsContainer.appendChild(document.createElement('br'));
		}
	}
	// No longer adding <br> and <hr> here as layout is handled by CSS flex/grid
}

function bingoBallSelect(ball){
	for(var idx = 0 ; idx < cards.length ; idx++){ // Changed loop variable to avoid conflict if 'index' is used elsewhere
		var card = cards[idx];
		const cardHeight = card.height || (card.value ? card.value.length : 0);
		const cardWidth = card.width || (card.value && card.value[0] ? card.value[0].length : 0);

		if (!card.bingoNums || !card.booleans) continue; // Skip if card not fully initialized

		for(var y = 0 ; y < cardHeight ; y++){
			for(var x = 0 ; x < cardWidth ; x++){
				// Ensure card.bingoNums[y][x] and card.booleans[y][x] exist
				if (!card.bingoNums[y] || typeof card.bingoNums[y][x] === 'undefined' || 
				    !card.booleans[y] || typeof card.booleans[y][x] === 'undefined') {
					continue;
				}

				if(card.bingoNums[y][x].innerText != ball) continue;

				if(card.booleans[y][x])
					continue;
				
				// Add 'on' to className if not already present
				if (!card.bingoNums[y][x].className.includes(' on')) {
					// Prefer adding to specific class if possible, or robustly add 'on'
					// Assuming 'bingoNum' is always present and we want 'bingoNum on'
					if (card.bingoNums[y][x].className.includes('bingoNum')) {
						card.bingoNums[y][x].className = card.bingoNums[y][x].className.replace('bingoNum', 'bingoNum on');
					} else { // Fallback if 'bingoNum' isn't there for some reason
						card.bingoNums[y][x].className += ' on';
					}
				}
				card.booleans[y][x] = true;
			}
		}
		checkBingoLine(card);
	}
}

function bingoBallUnSelect(ball){
	for(var idx = 0 ; idx < cards.length ; idx++){ // Changed loop variable
		var card = cards[idx];
		const cardHeight = card.height || (card.value ? card.value.length : 0);
		const cardWidth = card.width || (card.value && card.value[0] ? card.value[0].length : 0);

		if (!card.bingoNums || !card.booleans) continue; // Skip if card not fully initialized

		for(var y = 0 ; y < cardHeight ; y++){
			for(var x = 0 ; x < cardWidth ; x++){
				// Ensure card.bingoNums[y][x] and card.booleans[y][x] exist
				if (!card.bingoNums[y] || typeof card.bingoNums[y][x] === 'undefined' ||
				    !card.booleans[y] || typeof card.booleans[y][x] === 'undefined') {
					continue;
				}

				if(card.bingoNums[y][x].innerText != ball) continue;

				if(!card.booleans[y][x])
					continue;

				card.bingoNums[y][x].className = card.bingoNums[y][x].className.replace(' on', '');
				// Ensure 'go' is also removed if present, as 'on' is removed
				card.bingoNums[y][x].className = card.bingoNums[y][x].className.replace(' go', ''); 
				card.booleans[y][x] = false;
			}
		}

		checkBingoLine(card);
	}
}

function checkBingoLine(card) {
    const cardHeight = card.height || 0;
    const cardWidth = card.width || 0;

    if (cardWidth === 0 || cardHeight === 0 || !card.booleans || card.booleans.length !== cardHeight) {
        console.error("Card dimensions or booleans array not set up for checkBingoLine", card);
        if (card.cardTitle) card.cardTitle.innerText = card.no; // Reset title
        return;
    }

    var line = 0;

    // Check rows
    for (let r = 0; r < cardHeight; r++) {
        if (!card.booleans[r] || card.booleans[r].length !== cardWidth) continue; // Row malformed
        let rowLine = true;
        for (let c = 0; c < cardWidth; c++) {
            if (!card.booleans[r][c]) {
                rowLine = false;
                break;
            }
        }
        if (rowLine) line++;
    }

    // Check columns
    for (let c = 0; c < cardWidth; c++) {
        let colLine = true;
        for (let r = 0; r < cardHeight; r++) {
            if (!card.booleans[r] || card.booleans[r].length !== cardWidth || !card.booleans[r][c]) {
                colLine = false;
                break;
            }
        }
        if (colLine) line++;
    }

    // Check diagonals (only if square: cardWidth === cardHeight)
    if (cardWidth === cardHeight) {
        let diag1Line = true;
        for (let i = 0; i < cardWidth; i++) {
            if (!card.booleans[i] || card.booleans[i].length !== cardWidth || !card.booleans[i][i]) {
                diag1Line = false;
                break;
            }
        }
        if (diag1Line) line++;

        let diag2Line = true;
        for (let i = 0; i < cardWidth; i++) {
            if (!card.booleans[i] || card.booleans[i].length !== cardWidth || !card.booleans[i][cardWidth - 1 - i]) {
                diag2Line = false;
                break;
            }
        }
        if (diag2Line) line++;
    }
    
    // Determine "Bingo" threshold - let's use a simple rule for now:
    // For N x N cards, maybe N/2 lines for "Bingo"? Or keep it at 3 for familiarity?
    // The user's original code used ">= 3 lines" for Bingo on 5x5.
    // Let's keep this threshold for now. It means smaller cards might not easily hit "Bingo".
    // Or, a single full line could be "Bingo" for smaller cards.
    // The user's request was "6個數字同一列或同一行或斜的連線才算連線" (a line is a full line).
    // The distinction between "連線" (line) and "賓果" (Bingo!) is important.
    // Let's say 1 or 2 lines is "連線", and 3 or more is "賓果！" as per original logic.

    if (card.cardTitle) { // Ensure cardTitle element exists
        if (line == 0) {
            card.cardTitle.innerText = card.no;
        } else {
            if (line < 3) { 
                card.cardTitle.innerText = card.no + '  -  ' + line + ' 連線'; // Added space
            } else {
                card.cardTitle.innerText = card.no + '  賓果！';
            }
        }
    }

    if (card.rootNode && card.bingoNums) { // Ensure rootNode and bingoNums exist
        if (line >= 3) { // BINGO!!! threshold
            card.rootNode.className = 'cardContainer on';
            if (card.cardTitle) card.cardTitle.className = 'cardTitle on';
            // Dynamically adjust container height for taller "Bingo!" title (40px vs 20px default)
            if (cardWidth > 0 && cardHeight > 0) {
                card.rootNode.style.height = (cardHeight * 45 + 40) + 'px';
            }

            for(let r = 0; r < cardHeight; r++){
                for(let c = 0; c < cardWidth; c++){
                    if (card.bingoNums[r] && card.bingoNums[r][c]) {
                        // Highlight all selected numbers if it's a bingo
                        if (card.booleans[r] && card.booleans[r][c]) {
                             // Robustly add 'go' and remove 'on'
                            let cn = card.bingoNums[r][c].className;
                            cn = cn.replace(' on', ''); // Remove 'on'
                            if (!cn.includes(' go')) { // Add 'go' if not present
                                if (cn.includes('bingoNum')) {
                                    cn = cn.replace('bingoNum', 'bingoNum go');
                                } else {
                                    cn += ' go';
                                }
                            }
                            card.bingoNums[r][c].className = cn;
                        }
                    }
                }
            }
            setTimeout(function(){
                alert("！！！賓果！！！\n記得請WeiMing喝飲料!");
            }, 500);

        } else { // Not a "Bingo!" (less than 3 lines)
            card.rootNode.className = 'cardContainer'; // Default container class
            // Reset container height to normal title size (20px)
            if (cardWidth > 0 && cardHeight > 0) {
                 card.rootNode.style.height = (cardHeight * 45 + 20) + 'px';
            }
            if (card.cardTitle) {
                if (line > 0) { // 1 or 2 lines
                    card.cardTitle.className = 'cardTitle lv' + line;
                } else { // 0 lines
                    card.cardTitle.className = 'cardTitle';
                }
            }

            for(let r = 0; r < cardHeight; r++){
                for(let c = 0; c < cardWidth; c++){
                    if (card.bingoNums[r] && card.bingoNums[r][c]) {
                        let cn = card.bingoNums[r][c].className;
                        cn = cn.replace(' go', ''); // Remove 'go'
                        if (card.booleans[r] && card.booleans[r][c]) { // If selected
                            if (!cn.includes(' on')) { // Add 'on' if not present
                                if (cn.includes('bingoNum')) {
                                   cn = cn.replace('bingoNum', 'bingoNum on');
                                } else {
                                   cn += ' on';
                                }
                            }
                        } else { // If not selected
                            cn = cn.replace(' on', ''); // Remove 'on'
                        }
                        card.bingoNums[r][c].className = cn;
                    }
                }
            }
        }
    }
}

function createBingoCard() {
	// The totalCard text is now created in createBingoBall.
	// This function will now only create the individual card elements.

	if (!cardsPanelDiv) return; // Ensure cardsPanelDiv exists

	for(var index = 0 ; index < cards.length ; index++){
		var card = cards[index];
		
		// Use card's actual width and height, defaulting if not present
		const cardHeight = card.height || (card.value ? card.value.length : 0);
		const cardWidth = card.width || (card.value && card.value[0] ? card.value[0].length : 0);

		// Dynamically initialize card.booleans, accounting for wildcards
		card.booleans = [];
		if (cardHeight > 0 && cardWidth > 0) {
			for (let r = 0; r < cardHeight; r++) {
				let rowBooleans = [];
				for (let c = 0; c < cardWidth; c++) {
					// If the card value at [r][c] is 'X', it's a wildcard, so it's initially true (matched)
					rowBooleans.push(card.value[r][c] === 'X');
				}
				card.booleans.push(rowBooleans);
			}
		} else {
			card.booleans = [[false]]; // Minimal fallback
		}

		var cardContainer = document.createElement('div');
		cardContainer.className = 'cardContainer';
		if (cardsPanelDiv) cardsPanelDiv.appendChild(cardContainer);
		card.rootNode = cardContainer;

		card.bingoNums = [];

		var cardTitle = document.createElement('div');
		cardTitle.className = 'cardTitle';
		cardTitle.innerText = card.no;
		card.cardTitle = cardTitle;

		var delButton = document.createElement('input');
		delButton.className = 'delButton';
		delButton.type = 'button';
		delButton.value = 'X';
		delButton.card = card;
		delButton.onclick = confirmDelete;
		cardContainer.appendChild(cardTitle);
		cardContainer.appendChild(delButton);
		//cardContainer.appendChild(delButton);

		// Dynamically set card container size using the already defined cardHeight and cardWidth
		if (cardWidth > 0 && cardHeight > 0) {
			cardContainer.style.width = (cardWidth * 45) + 'px';
			// Height of title div is 20px. Each number cell is 45px (37px + 2*2px margin + 2*2px border/padding related)
			// Let's assume 45px per row for numbers, plus 20px for title.
			cardContainer.style.height = (cardHeight * 45 + 20) + 'px';
		}


		for(var y = 0 ; y < cardHeight ; y++){
			card.bingoNums.push([]);
			for(var x = 0 ; x < cardWidth ; x++){
				var bingoNum = document.createElement('div');
				// Generic color class assignment
				const colorIndex = (y + x) % 5; // Cycle through 5 colors
				let colorClass = '';
				switch (colorIndex) {
					case 0: colorClass = 'bng-pink'; break;
					case 1: colorClass = 'bng-green'; break;
					case 2: colorClass = 'bng-purple'; break;
					case 3: colorClass = 'bng-orange'; break;
					case 4: colorClass = 'bng-blue'; break;
				}
				bingoNum.className = 'bingoNum ' + colorClass;
				
				const cellValue = (card.value && card.value[y] && typeof card.value[y][x] !== 'undefined') ? card.value[y][x] : '';
				bingoNum.innerText = cellValue || '--';

				if (cellValue === 'X') {
					bingoNum.className += ' wildcard on'; // Wildcards are always 'on' and have special style
				}
				cardContainer.appendChild(bingoNum);
				card.bingoNums[y].push(bingoNum);
			}
		}
	}
}


function createNewBingoCard() {
	newCard = new function(){};
	newCard.no = '';
	newCard.value = [
		['', '', '', '', ''],
		['', '', '', '', ''],
		['', '', '', '', ''],
		['', '', '', '', ''],
		['', '', '', '', '']
	];

	var cardContainer = document.createElement('div');
	cardContainer.className = 'cardContainer new';
	if (cardsPanelDiv) cardsPanelDiv.appendChild(cardContainer); // Append to cards panel
	newCard.rootNode = cardContainer;

	newCard.bingoNums = [];

	var cardTitle = document.createElement('input');
	cardTitle.type = 'number';
	cardTitle.className = 'cardTitleInput';

	cardTitle.onfocus = function(){
		try{
			this.setSelectionRange(0, 4);
		}catch(e){
		}
	}
	cardTitle.onblur = function(){
		window.scrollTo(0,0);
	}

	cardTitle.value = padLeft(cards.length+1, 4);

	cardContainer.cardTitle = cardTitle;
	cardContainer.appendChild(cardTitle);

	for(var y = 0 ; y < 5 ; y++){
			newCard.bingoNums.push([]);
		for(var x = 0 ; x < 5 ; x++){ // This function still creates 5x5 cards by default
			var bingoNum = document.createElement('div');
			// Generic color class assignment
			const colorIndex = (y + x) % 5; // Cycle through 5 colors
			let colorClass = '';
			switch (colorIndex) {
				case 0: colorClass = 'bng-pink'; break;
				case 1: colorClass = 'bng-green'; break;
				case 2: colorClass = 'bng-purple'; break;
				case 3: colorClass = 'bng-orange'; break;
				case 4: colorClass = 'bng-blue'; break;
			}
			bingoNum.className = 'bingoNum ' + colorClass;
			bingoNum.innerText = (newCard.value[y][x]) ? newCard.value[y][x] : '--';
			cardContainer.appendChild(bingoNum);
			newCard.bingoNums[y].push(bingoNum);
		}
	}

	var delButton = document.createElement('input');
	delButton.className = 'okButton';
	delButton.type = 'button';
	delButton.value = '完成';
	delButton.onclick = confirmAdd;
	cardContainer.appendChild(delButton);

	cardTitle.focus();

	try{
		cardTitle.setSelectionRange(0, 4);
	}catch(e){
	}
}

function addNumber(value){
	for(var y = 0 ; y < newCard.value.length ; y ++){
		var arr = newCard.value[y];

		for(var x = 0 ; x < arr.length ; x ++){
			if(!arr[x]){
				arr[x] = value;

				newCard.bingoNums[y][x].innerText = value;
				if(y == 4 && x == 4){

				}else
					return;
			}
		}
	}

	setTimeout(function(){
		newCard.no = newCard.rootNode.cardTitle.value;
		var answer = confirm ('你確定要新增卡片 No.'+ newCard.no + ' ?');
		if (answer){
			confirmAdd();
		}
	}, 100);
}

function removeNumber(value){
	for(var y = 0 ; y < newCard.value.length ; y ++){
		var arr = newCard.value[y];

		for(var x = 0 ; x < arr.length ; x ++){
			if(arr[x] == value){
				arr[x] = '';

				newCard.bingoNums[y][x].innerText = '--';
				return;
			}
		}

	}
}
//-----------------------------------

function confirmAddAllCards() {
    if (typeof previewCards === 'undefined' || previewCards.length === 0) {
        alert('沒有可新增的卡片。請先生成卡片。');
        return;
    }

    let newCardsToAdd = [];
    let existingCardNumbers = cards.map(card => card.no);
    let newCardNumbersInBatch = [];

    for (let i = 0; i < previewCards.length; i++) {
        let pCard = previewCards[i];
        let cardNo = pCard.cardTitleInput.value.trim();

        if (!cardNo) {
            alert('卡片號碼不可為空。請檢查所有預覽卡片。');
            pCard.cardTitleInput.focus();
            return;
        }

        if (existingCardNumbers.includes(cardNo) || newCardNumbersInBatch.includes(cardNo)) {
            alert('卡片號碼 NO.' + cardNo + ' 重複了。請修改。');
            pCard.cardTitleInput.focus();
            return;
        }
        
        let cardToAdd = {
            no: cardNo,
            value: pCard.value,
            height: pCard.value.length,
            width: pCard.value[0] ? pCard.value[0].length : 0
            // rootNode and bingoNums are mostly for display during preview and might not be needed in the 'cards' array structure
            // or can be recreated if necessary when displaying cards from the 'cards' array.
        };
        newCardsToAdd.push(cardToAdd);
        newCardNumbersInBatch.push(cardNo);
    }

    if (newCardsToAdd.length > 0) {
        cards.push(...newCardsToAdd);
        saveCardToLocal(); // This function already handles the 'cards' array
        previewCards = []; // Clear the preview cards array (defined in index.html)
        
        // Clear the visual preview cards from the DOM
        const newCardContainers = document.querySelectorAll('#cards-panel .cardContainer.new'); // Updated selector
        newCardContainers.forEach(container => container.remove());
        
        location.reload();
    }
}

function confirmDelete(){
	var answer = confirm ('你確定要刪除卡片 NO.'+ this.card.no + ' ?');
	if (answer){
		var temp = [];
		for(var index = 0 ; index < cards.length ; index++){
			if(cards[index].no == this.card.no)
				continue;
			temp.push(cards[index]);
		}
		cards = temp;
		saveCardToLocal();

		location.reload();
	}
}

function confirmAdd(){

	newCard.no = newCard.rootNode.cardTitle.value;

	//var answer = confirm ('你確定要新增卡片 #'+ newCard.no + ' ?');
	if (true){//answer
		var dulipcate = false;
		for(var index = 0 ; index < cards.length ; index++){
			if(cards[index].no == newCard.no){
				dulipcate = true;
				break;
			}
		}

		if(dulipcate){
			alert('卡片號碼 NO.' + newCard.no + ' 重複了');
			newCard.rootNode.cardTitle.focus();
			return;
		}

		cards.push(newCard);
		saveCardToLocal();

		location.reload();
	}
};

function addCard(){
	// rootDiv is the main container for bingo balls/cards, not body.
	// If rootDiv is meant to be removed, ensure it's the correct one.
	// For now, let's assume we are clearing the content panels.
	// document.body.removeChild(rootDiv); // This seems too drastic, might remove particles.js or controls

	if (bingoNumbersPanelDiv) {
		while (bingoNumbersPanelDiv.hasChildNodes()) {
			bingoNumbersPanelDiv.removeChild(bingoNumbersPanelDiv.lastChild);
		}
	}
	if (cardsPanelDiv) {
		while (cardsPanelDiv.hasChildNodes()) {
			cardsPanelDiv.removeChild(cardsPanelDiv.lastChild);
		}
	}
	// If rootDiv itself needs clearing (e.g. it held old structure), do it here.
    // However, createBingoBall and createNewBingoCard now append to specific panels.

	newCard = true;
	createBingoBall(); // This will now populate bingoNumbersPanelDiv
	createNewBingoCard(); // This will now populate cardsPanelDiv
}

function strToCard(str){
	var parts = str.split(':');
	var card = new function(){};
	card.no = parts[0];
	// Expecting format: no:width:height:value1,value2,...
	if (parts.length === 4) { // New format with width and height
		card.width = parseInt(parts[1], 10);
		card.height = parseInt(parts[2], 10);
		var values = parts[3].split(',');
		
		card.value = [];
		if (isNaN(card.width) || isNaN(card.height) || card.width <= 0 || card.height <= 0) {
			// Fallback or error for invalid dimensions - perhaps default to 5x5 or skip card
			console.error("Invalid dimensions in card data:", str, "Falling back to 5x5 interpretation for values if possible or skipping.");
            // Attempt to parse as old 5x5 format if values length matches
            if (values.length % 5 === 0 && values.length > 0) { // Basic check for old format
                card.width = 5;
                card.height = values.length / 5;
                 let k_old = 0;
                for (let i = 0; i < card.height; i++) {
                    let row_old = [];
                    for (let j = 0; j < card.width; j++) {
                        row_old.push(values[k_old++]);
                    }
                    card.value.push(row_old);
                }
            } else {
                // Cannot reliably parse, card will be empty or malformed
                 card.value = [[]]; // Empty card
                 card.width = 0;
                 card.height = 0;
            }
		} else {
			let k = 0;
			for (let i = 0; i < card.height; i++) {
				let row = [];
				for (let j = 0; j < card.width; j++) {
					if (k < values.length) {
						row.push(values[k++]);
					} else {
						row.push(''); // Fill with empty if not enough values (data corruption?)
					}
				}
				card.value.push(row);
			}
		}
	} else if (parts.length === 2) { // Old format: no:value1,value2,... (assume 5xN)
		console.warn("Old card format detected for card NO.", card.no, "Assuming 5 columns.");
		var values = parts[1].split(',');
		card.width = 5;
		card.height = Math.ceil(values.length / 5); // Calculate height based on 5 columns
		if (values.length === 0) card.height = 0;

		card.value = [];
		let k_old = 0;
		for (let i = 0; i < card.height; i++) {
			let row_old = [];
			for (let j = 0; j < card.width; j++) {
				if (k_old < values.length) {
					row_old.push(values[k_old++]);
				} else {
					row_old.push(''); // Pad if not enough values for a full last row
				}
			}
			card.value.push(row_old);
		}
	} else {
		console.error("Unknown card data format:", str);
		card.value = [[]]; // Empty/invalid card
		card.width = 0;
		card.height = 0;
	}
	return card;
}

function cardToStr(card){
	// Ensure card.width and card.height exist, default if not (e.g. for older cards)
	const width = card.width || 5;
	const height = card.height || (card.value && card.value.length ? card.value.length : 0);

	var str = card.no + ':' + width + ':' + height + ':';
	let flatValues = [];
	if (card.value) {
		for(var i = 0 ; i < card.value.length ; i++){
			if (card.value[i] && Array.isArray(card.value[i])) {
				flatValues.push(...card.value[i]);
			}
		}
	}
	str += flatValues.join(',');
	return str;
}

function saveCardToLocal(){
	var cardsStr = "";

	for(var index = 0 ; index < cards.length ; index ++){
		if(cardsStr.length > 0)
			cardsStr += '|';
		cardsStr += cardToStr(cards[index]);
	}
	console.log("Saving to localStorage:", cardsStr); // Log data being saved
	setData("CARDS", cardsStr);
	//alert("Save " + cardsStr);
}

function readCardsFromLocal(){
	var cardsStr = getData("CARDS");
	//alert("Load " + cardsStr);

	cards = [];
	if(cardsStr) {
		var cardsStrArray = cardsStr.split('|');

		for(var index = 0 ; index < cardsStrArray.length ; index ++){
			cards.push(strToCard(cardsStrArray[index]));
		}
	}

	cards = cards.sort(function(a, b){
		return parseInt(a.no) - parseInt(b.no)
	});

	//alert("card # - " + cards.length);
}

function padLeft(str, len) {
    str = '' + str;
    if (str.length >= len) {
        return str;
    } else {
        return padLeft("0" + str, len);
    }
}
//---------------------------------------------------
function setData(key, value) {
	localStorage.setItem(key, value);
}

function getData(key) {
	return localStorage.getItem(key);
}
