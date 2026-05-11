
const WINNING_COMBOS = [
	[0,1,2],[3,4,5],[6,7,8],
	[0,3,6],[1,4,7],[2,5,8],
	[0,4,8],[2,4,6]
];

let smallBoards = Array.from({length:9}, ()=> Array(9).fill(0));
let smallStatus = Array(9).fill(0); // 0 ongoing, 1 X, 2 O, 3 draw
let currentPlayer = 1; // 1 -> X, 2 -> O
let activeBoard = -1; // -1 means any
let gameOver = false;

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

function init(){
	buildDom();
	updateUI();
	resetBtn.addEventListener('click', resetGame);
}

function buildDom(){
	boardEl.innerHTML = '';
	for(let b=0;b<9;b++){
		const sb = document.createElement('div');
		sb.className = 'small-board';
		sb.dataset.board = b;

		for(let c=0;c<9;c++){
			const cell = document.createElement('div');
			cell.className = 'cell';
			cell.dataset.board = b;
			cell.dataset.cell = c;
			cell.addEventListener('click', ()=> handleCellClick(b,c));
			sb.appendChild(cell);
		}

		const overlay = document.createElement('div');
		overlay.className = 'overlay';
		overlay.textContent = '';
		sb.appendChild(overlay);

		boardEl.appendChild(sb);
	}
}

function handleCellClick(b, c){
	if(gameOver) return;
	if(activeBoard !== -1 && activeBoard !== b) return;
	if(smallStatus[b] !== 0) return;
	if(smallBoards[b][c] !== 0) return;

	smallBoards[b][c] = currentPlayer;

	const winner = checkSmallBoard(b);
	if(winner) smallStatus[b] = winner;
	else if(smallBoards[b].every(v=>v!==0)) smallStatus[b] = 3; // draw

	const bigWinner = checkBigBoard();
	if(bigWinner){
		gameOver = true;
		showGameOver(bigWinner);
		updateUI();
		return;
	}

	if(smallStatus.every(s=>s!==0)){
		gameOver = true;
		statusEl.textContent = 'Game ends in a draw';
		updateUI();
		return;
	}

	const nextActive = c;
	if(smallStatus[nextActive] === 0) activeBoard = nextActive;
	else activeBoard = -1; // any

	currentPlayer = currentPlayer === 1 ? 2 : 1;
	updateUI();
}

function checkSmallBoard(b){
	const arr = smallBoards[b];
	for(const [a,x,y] of WINNING_COMBOS){}
	for(const combo of WINNING_COMBOS){
		const [i,j,k] = combo;
		if(arr[i] !== 0 && arr[i] === arr[j] && arr[j] === arr[k]){
			return arr[i];
		}
	}
	return 0;
}

function checkBigBoard(){
	// map smallStatus to player cells (1 or 2)
	for(const combo of WINNING_COMBOS){
		const [i,j,k] = combo;
		if(smallStatus[i] !== 0 && smallStatus[i] !== 3 && smallStatus[i] === smallStatus[j] && smallStatus[j] === smallStatus[k]){
			return smallStatus[i];
		}
	}
	return 0;
}

function showGameOver(player){
	statusEl.textContent = `Player ${player===1? 'X' : 'O'} wins the game!`;
}

function updateUI(){
	// update cells
	// mark which player's turn for CSS coloring
	boardEl.classList.toggle('player-x', currentPlayer === 1);
	boardEl.classList.toggle('player-o', currentPlayer === 2);
	const boardChildren = Array.from(boardEl.children);
	for(let b=0;b<9;b++){
		const sb = boardChildren[b];
		const cells = Array.from(sb.querySelectorAll('.cell'));

		// classes for active
		sb.classList.remove('active','won-x','won-o','draw');
		if(smallStatus[b] === 1) sb.classList.add('won-x');
		else if(smallStatus[b] === 2) sb.classList.add('won-o');
		else if(smallStatus[b] === 3) sb.classList.add('draw');

		if(!gameOver && (activeBoard === -1 ? smallStatus[b] === 0 : activeBoard === b)){
			sb.classList.add('active');
		}

		const overlay = sb.querySelector('.overlay');
		if(smallStatus[b] === 1) overlay.textContent = 'X';
		else if(smallStatus[b] === 2) overlay.textContent = 'O';
		else if(smallStatus[b] === 3) overlay.textContent = 'Draw';
		else overlay.textContent = '';

		for(let c=0;c<9;c++){
			const val = smallBoards[b][c];
			const cell = cells[c];
			cell.classList.remove('x','o');
			if(val === 1){ cell.textContent = 'X'; cell.classList.add('x'); }
			else if(val === 2){ cell.textContent = 'O'; cell.classList.add('o'); }
			else cell.textContent = '';
		}
	}

	if(gameOver) return;
	statusEl.textContent = `Player ${currentPlayer===1? 'X' : 'O'}'s turn`;
}

function resetGame(){
	smallBoards = Array.from({length:9}, ()=> Array(9).fill(0));
	smallStatus = Array(9).fill(0);
	currentPlayer = 1;
	activeBoard = -1;
	gameOver = false;
	updateUI();
}

init();
