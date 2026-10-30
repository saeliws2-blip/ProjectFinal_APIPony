// =========================================================
// GLOBAL VARIABLES
// =========================================================
let characters = [];
let selectedTeam = [];
let currentPage = 1;
const charactersPerPage = 20;

// Battle State
let playerTeamState = [];
let enemyTeamState = [];
let activeAttackerIndex = 0;
let currentTurn = 'player'; // 'player' | 'enemy'
let isBattleOver = false;
let selectedAction = null;
let isAutoBattle = false;

// =========================================================
// 1. DATA MAPPING & FIXED STATS ALGORITHM
// =========================================================
function calculateFixedStats(pony) {
    // 1. แปลงค่าชนิดม้า (Kind) และอาชีพ (Occupation) เป็น Stats ตั้งต้น
    const kindText = (pony.kind || []).join(' ').toLowerCase();
    const occText = (pony.occupation || '').toLowerCase();
    
    let baseMagic = 50;
    let baseSpeed = 50;
    let baseStrength = 50;
    let baseFriendship = 50;

    if (kindText.includes('alicorn')) { baseMagic = 95; baseSpeed = 85; baseStrength = 80; }
    else if (kindText.includes('unicorn')) { baseMagic = 85; baseSpeed = 60; baseStrength = 55; }
    else if (kindText.includes('pegasus')) { baseMagic = 40; baseSpeed = 90; baseStrength = 70; }
    else if (kindText.includes('earth')) { baseMagic = 30; baseSpeed = 65; baseStrength = 90; }

    if (occText.includes('party') || occText.includes('baker')) baseFriendship += 30;
    if (occText.includes('guard') || occText.includes('captain')) baseStrength += 20;

    // 2. คำนวณค่าพลังโจมตีคงที่ (Fixed Atk) และเลือดสูงสุด (Max HP)
    const fixedAtk = Math.round((baseMagic * 0.8) + (baseSpeed * 0.5));
    const maxHp = Math.round((baseStrength * 5) + (baseFriendship * 3));

    return {
        ...pony,
        atk: fixedAtk,               // พลังโจมตีคงที่ (ไม่มีสุ่ม ±15%)
        maxHp: maxHp,                // เลือดสูงสุด
        hp: maxHp,                   // เลือดปัจจุบัน
        energy: 0,                   // เกจไม้ตาย (0 - 100)
        specialName: getSpecialSkillName(pony.name, kindText)
    };
}

function getSpecialSkillName(name, kindText) {
    if (name.includes('Twilight')) return 'Magic Beam Burst 💥';
    if (name.includes('Rainbow')) return 'Sonic Rainboom 🌈';
    if (name.includes('Pinkie')) return 'Party Cannon Blast 🎉';
    if (kindText.includes('unicorn')) return 'Arcane Flare ✨';
    if (kindText.includes('pegasus')) return 'Tornado Kick 🌪️';
    return 'Mega Impact 🔨';
}

// =========================================================
// 2. FETCH & RENDER CHARACTERS
// =========================================================
async function loadCharacters() {
    try {
        const response = await fetch('/characters');
        if (!response.ok) throw new Error('Network error');
        const result = await response.json();
        if (!Array.isArray(result.data)) throw new Error('Invalid character data');
        characters = result.data.map(calculateFixedStats);
    } catch (error) {
        console.warn('ดึงข้อมูล API ไม่สำเร็จ ใช้ Mock Data สำรองแทน');
        characters = getMockData().map(calculateFixedStats);
    }
    renderCharactersGrid();
}

function renderCharactersGrid() {
    const container = document.getElementById('charactersGrid');
    const searchKeyword = document.getElementById('searchInput').value.trim().toLowerCase();
    const selectedSeason = document.getElementById('seasonSort').value;
    const sortOrder = document.getElementById('characterSort').value;
    
    container.innerHTML = '';
    const isTeamFull = selectedTeam.length >= 3;

    const filtered = characters
        .filter(character => character.name.toLowerCase().includes(searchKeyword))
        .filter(character => selectedSeason === 'all'
            || (character.seasons || []).includes(Number(selectedSeason)))
        .sort((first, second) => {
            if (sortOrder === 'atk-desc') return second.atk - first.atk;
            if (sortOrder === 'atk-asc') return first.atk - second.atk;
            if (sortOrder === 'hp-desc') return second.maxHp - first.maxHp;
            if (sortOrder === 'hp-asc') return first.maxHp - second.maxHp;

            const result = first.name.localeCompare(second.name, 'en', { sensitivity: 'base' });
            return sortOrder === 'desc' ? -result : result;
        });
    const totalPages = Math.ceil(filtered.length / charactersPerPage);
    currentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
    const startIndex = (currentPage - 1) * charactersPerPage;
    const pageCharacters = filtered.slice(startIndex, startIndex + charactersPerPage);

    pageCharacters.forEach(pony => {
        const isSelected = selectedTeam.some(p => p.id === pony.id);
        const card = document.createElement('div');
        
        card.className = `card ${isSelected ? 'selected' : ''} ${!isSelected && isTeamFull ? 'disabled' : ''}`;

        let btnText = '➕ เลือกเข้าทีม';
        let btnDisabled = false;

        if (isSelected) {
            btnText = '✓ เลือกแล้ว (คลิกเพื่อยกเลิก)';
        } else if (isTeamFull) {
            btnText = '🔒 ทีมเต็มแล้ว (สูงสุด 3 ตัว)';
            btnDisabled = true; // ล็อคปุ่มเมื่อเลือกครบ 3 ตัว
        }

        card.innerHTML = `
            <img src="${pony.image && pony.image[0] ? pony.image[0] : ''}" alt="${pony.name}">
            <h3 style="margin: 8px 0 4px;">${pony.name}</h3>
            <p style="font-size: 12px; color: #666; margin: 0 0 8px;">
                HP: ${pony.maxHp} | ATK: ${pony.atk}
            </p>
            <button class="details-btn" type="button">ℹ️ ดูข้อมูลตัวละคร</button>
            <button class="select-btn" ${btnDisabled ? 'disabled' : ''}>
                ${btnText}
            </button>
        `;

        card.querySelector('.details-btn').addEventListener('click', () => {
            showCharacterDetails(pony);
        });

        card.querySelector('.select-btn').addEventListener('click', () => toggleTeamMember(pony));

        container.appendChild(card);
    });

    if (pageCharacters.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.style.cssText = 'text-align:center; grid-column:1/-1; padding:40px;';
        emptyMessage.textContent = 'ไม่พบตัวละครที่ตรงกับเงื่อนไข';
        container.appendChild(emptyMessage);
    }

    const previousButton = document.getElementById('previousPageBtn');
    const nextButton = document.getElementById('nextPageBtn');
    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
    document.getElementById('paginationStatus').textContent =
        `หน้า ${totalPages ? currentPage : 0} / ${totalPages}`;
}

function toggleTeamMember(pony) {
    const isSelected = selectedTeam.some(member => member.id === pony.id);
    if (isSelected) {
        selectedTeam = selectedTeam.filter(member => member.id !== pony.id);
    } else if (selectedTeam.length < 3) {
        selectedTeam.push(pony);
    }

    updateTop3UI();
    renderCharactersGrid();
    updateCharacterPopupSelectButton(pony);
}

function updateCharacterPopupSelectButton(pony) {
    const button = document.getElementById('characterDetailSelectBtn');
    if (!button) return;

    const isSelected = selectedTeam.some(member => member.id === pony.id);
    const isTeamFull = selectedTeam.length >= 3;
    button.disabled = !isSelected && isTeamFull;
    button.textContent = isSelected
        ? '✓ เลือกแล้ว (คลิกเพื่อยกเลิก)'
        : isTeamFull
            ? '🔒 ทีมเต็มแล้ว'
            : '➕ เลือกเข้าทีม';
}

function formatCharacterDetail(value) {
    if (Array.isArray(value)) {
        return value.length ? value.join(', ') : 'ไม่มีข้อมูล';
    }

    if (value === undefined || value === null || value === '') {
        return 'ไม่มีข้อมูล';
    }

    return String(value);
}

function showCharacterDetails(pony) {
    const content = document.getElementById('characterDetailContent');
    const modal = document.getElementById('characterModal');
    const header = document.createElement('div');
    header.className = 'character-detail-header';

    if (pony.image && pony.image[0]) {
        const image = document.createElement('img');
        image.className = 'character-detail-image';
        image.src = pony.image[0];
        image.alt = pony.name;
        header.appendChild(image);
    }

    const heading = document.createElement('div');
    heading.className = 'character-detail-heading';
    const name = document.createElement('h2');
    name.id = 'characterDetailName';
    name.textContent = pony.name || 'ไม่ทราบชื่อ';

    const stats = document.createElement('div');
    stats.className = 'character-detail-stats';
    stats.textContent = `❤️ HP ${pony.maxHp}  |  ⚔️ ATK ${pony.atk}`;
    heading.append(name, stats);
    header.appendChild(heading);

    const selectButton = document.createElement('button');
    selectButton.id = 'characterDetailSelectBtn';
    selectButton.className = 'character-detail-select-btn';
    selectButton.type = 'button';
    selectButton.addEventListener('click', () => toggleTeamMember(pony));
    header.appendChild(selectButton);
    content.replaceChildren(header);
    updateCharacterPopupSelectButton(pony);

    const details = document.createElement('dl');
    details.className = 'character-details';
    const detailRows = [
        ['ประเภท', pony.kind],
        ['ชื่ออื่น', pony.alias],
        ['เพศ', pony.sex],
        ['ที่อยู่อาศัย', pony.residence],
        ['อาชีพ', pony.occupation],
        ['ซีซันที่ปรากฏ', pony.seasons],
        ['จำนวนตอนที่พบ', pony.episodeCount],
        ['สกิลพิเศษ', pony.specialName]
    ];

    detailRows.forEach(([label, value]) => {
        const row = document.createElement('div');
        const term = document.createElement('dt');
        const description = document.createElement('dd');
        term.textContent = label;
        description.textContent = formatCharacterDetail(value);
        row.append(term, description);
        details.appendChild(row);
    });
    content.appendChild(details);

    const episodesSection = document.createElement('section');
    episodesSection.className = 'character-episodes';
    const episodesHeading = document.createElement('h3');
    episodesHeading.textContent = 'ตอนที่ปรากฏ';
    episodesSection.appendChild(episodesHeading);

    const episodesList = document.createElement('ul');
    const episodes = Array.isArray(pony.appearanceEpisodes) ? pony.appearanceEpisodes : [];
    if (episodes.length) {
        episodes.forEach(episode => {
            const item = document.createElement('li');
            item.textContent = `${episode.code || `S${episode.season}E${episode.episode}`} - ${episode.name || 'ไม่พบชื่อ Episode'}`;
            episodesList.appendChild(item);
        });
    } else {
        const item = document.createElement('li');
        item.textContent = 'ไม่มีข้อมูลตอนที่ปรากฏ';
        episodesList.appendChild(item);
    }
    episodesSection.appendChild(episodesList);
    content.appendChild(episodesSection);

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
}

function closeCharacterDetails() {
    const modal = document.getElementById('characterModal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

function updateTop3UI() {
    const slots = document.querySelectorAll('.slot');
    const medals = ['🥇', '🥈', '🥉'];
    const confirmBtn = document.getElementById('confirmBtn');

    slots.forEach((slot, index) => {
        if (selectedTeam[index]) {
            const pony = selectedTeam[index];
            slot.className = 'slot filled';
            slot.innerHTML = `
                <p style="margin:0;">${medals[index]} Rank ${index + 1}</p>
                <img src="${pony.image[0]}" alt="${pony.name}">
                <strong>${pony.name}</strong>
                <div class="slot-stats">HP: ${pony.maxHp} | ATK: ${pony.atk}</div>
                <button class="delete-btn" onclick="event.stopPropagation(); removeTeamMember(${index})">🗑️ ลบ</button>
            `;
        } else {
            slot.className = 'slot';
            slot.innerHTML = `<p>${medals[index]} Rank ${index + 1}</p><span>ยังไม่ได้เลือก</span>`;
        }
    });

    // ปุ่มกดยืนยันต่อสู้จะกดได้ต่อเมื่อเลือกครบ 3 ตัวเท่านั้น
    if (selectedTeam.length === 3) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '⚔️ ยืนยันทีม & เริ่มการต่อสู้!';
    } else {
        confirmBtn.disabled = true;
        confirmBtn.textContent = `⚔️ กรุณาเลือกตัวละครให้ครบ 3 ตัว (เลือกแล้ว ${selectedTeam.length}/3)`;
    }

    document.getElementById('clearTeamBtn').hidden = selectedTeam.length !== 3;
}

function clearSelectedTeam() {
    if (selectedTeam.length !== 3) return;

    selectedTeam = [];
    updateTop3UI();
    renderCharactersGrid();

    const selectButton = document.getElementById('characterDetailSelectBtn');
    if (selectButton) {
        selectButton.textContent = '➕ เลือกเข้าทีม';
        selectButton.disabled = false;
    }
}

function removeTeamMember(index) {
    selectedTeam.splice(index, 1);
    updateTop3UI();
    renderCharactersGrid();
}

// =========================================================
// 3. BATTLE ENGINE (MANUAL PLAYER ACTIONS)
// =========================================================
function startBattle() {
    if (selectedTeam.length !== 3) return;

    // รีเซ็ตค่าสเตตัสสำหรับต่อสู้
    playerTeamState = JSON.parse(JSON.stringify(selectedTeam));
    
    // สุ่มสร้างทีมศัตรู 3 ตัว
    const shuffled = [...characters].sort(() => 0.5 - Math.random());
    enemyTeamState = JSON.parse(JSON.stringify(shuffled.slice(0, 3)));

    activeAttackerIndex = 0;
    currentTurn = 'player';
    isBattleOver = false;
    selectedAction = null;
    isAutoBattle = false;
    updateAutoBattleButton();
    playerTeamState.forEach(pony => {
        pony.isGuarding = false;
    });
    document.getElementById('battleLog').innerHTML = '<div>🔔 การต่อสู้เริ่มต้นขึ้นแล้ว!</div>';
    
    document.getElementById('battleModal').style.display = 'flex';
    renderBattleArena();
}

function renderBattleArena() {
    const playerCol = document.getElementById('playerTeamColumn');
    const enemyCol = document.getElementById('enemyTeamColumn');

    playerCol.innerHTML = '<h4 style="margin:0 0 8px; color:#a78bfa;">ฝั่งของคุณ</h4>';
    enemyCol.innerHTML = '<h4 style="margin:0 0 8px; color:#f43f5e;">ฝั่งศัตรู</h4>';

    // Render Player Team
    playerTeamState.forEach((pony, i) => {
        const isDead = pony.hp <= 0;
        const isActive = (i === activeAttackerIndex && currentTurn === 'player' && !isDead);
        const hpPercent = Math.max(0, (pony.hp / pony.maxHp) * 100);

        playerCol.innerHTML += `
            <div class="fighter-card ${isActive ? 'active-attacker' : ''} ${isDead ? 'dead' : ''}">
                <img src="${pony.image[0]}" alt="${pony.name}">
                <div class="bar-container">
                    <div style="font-weight:bold; font-size:14px;">${pony.name}</div>
                    <div class="hp-bar-bg"><div class="hp-bar-fill" style="width:${hpPercent}%"></div></div>
                    <div class="energy-bar-bg"><div class="energy-bar-fill" style="width:${pony.energy}%"></div></div>
                    <div style="font-size:11px; margin-top:2px; color:#94a3b8;">HP: ${pony.hp}/${pony.maxHp} | MP: ${pony.energy}%${pony.isGuarding ? ' | 🛡️ กำลังป้องกัน' : ''}</div>
                </div>
            </div>
        `;
    });

    // Render Enemy Team
    enemyTeamState.forEach((pony, i) => {
        const isDead = pony.hp <= 0;
        const hpPercent = Math.max(0, (pony.hp / pony.maxHp) * 100);

        const awaitingTarget = selectedAction === 'basic' || selectedAction === 'special';
        enemyCol.innerHTML += `
            <div class="fighter-card targetable ${isDead ? 'dead' : ''} ${awaitingTarget ? 'awaiting-target' : ''}" onclick="userSelectTarget(${i})">
                <img src="${pony.image[0]}" alt="${pony.name}">
                <div class="bar-container">
                    <div style="font-weight:bold; font-size:14px;">${pony.name}</div>
                    <div class="hp-bar-bg"><div class="hp-bar-fill" style="width:${hpPercent}%; background:#f43f5e;"></div></div>
                    <div style="font-size:11px; margin-top:4px; color:#94a3b8;">HP: ${pony.hp}/${pony.maxHp}</div>
                </div>
            </div>
        `;
    });

    // อัปเดตปุ่มและคำแนะนำสำหรับการเลือกคำสั่งด้วยตนเอง
    const currentAttacker = playerTeamState[activeAttackerIndex];
    const specBtn = document.getElementById('specialAtkBtn');
    const playerCanAct = !isAutoBattle && currentTurn === 'player' && !isBattleOver && currentAttacker?.hp > 0;
    document.getElementById('basicAtkBtn').disabled = !playerCanAct;
    specBtn.disabled = !playerCanAct || currentAttacker.energy < 100;
    document.getElementById('defendBtn').disabled = !playerCanAct;
    document.getElementById('basicAtkBtn').classList.toggle('selected', selectedAction === 'basic');
    specBtn.classList.toggle('selected', selectedAction === 'special');

    const prompt = document.getElementById('actionPrompt');
    if (isAutoBattle && currentTurn === 'player') {
        prompt.textContent = 'กำลังเล่นอัตโนมัติ...';
    } else if (currentTurn !== 'player') {
        prompt.textContent = 'ถึงเทิร์นของทีมศัตรู...';
    } else if (selectedAction === 'basic' || selectedAction === 'special') {
        prompt.textContent = `เลือกตัวละครฝั่งศัตรูที่ต้องการ${selectedAction === 'basic' ? 'โจมตี' : 'ใช้สกิลใส่'}`;
    } else {
        prompt.textContent = 'เลือกโจมตีปกติ สกิลพิเศษ หรือป้องกันด้วยตนเอง';
    }
}

// ---------------------------------------------------------
// FIXED DAMAGE ATTACK LOGIC
// ---------------------------------------------------------
function executeAttack(attacker, target, isSpecial) {
    if (isBattleOver || target.hp <= 0) return;

    // คำนวณความเสียหายแบบ Fixed Damage 100% (ไม่บวกลบ 15%)
    const damage = isSpecial ? Math.round(attacker.atk * 1.8) : attacker.atk;

    target.hp = Math.max(0, target.hp - damage);

    // อัปเดตเกจ Energy
    if (isSpecial) {
        attacker.energy = 0; // ใช้ท่าใหญ่แล้ว Energy ลดเหลือ 0
    } else {
        attacker.energy = Math.min(100, attacker.energy + 35); // โจมตีปกติได้ Energy +35%
    }
    target.energy = Math.min(100, target.energy + 20); // โดนโจมตีได้ Energy +20%

    // บันทึก Log
    const skillName = isSpecial ? `ใช้สกิลพิเศษ [${attacker.specialName}]` : 'โจมตีปกติ';
    logMessage(`⚔️ <b>${attacker.name}</b> ${skillName} ใส่ <b>${target.name}</b> ทำความเสียหายคงที่ <b style="color:#f43f5e;">${damage}</b> หน่วย!`);

    renderBattleArena();
    checkGameOver();

    if (!isBattleOver) {
        switchTurn();
    }
}

function userSelectAction(type) {
    if (currentTurn !== 'player' || isBattleOver) return;
    const attacker = playerTeamState[activeAttackerIndex];
    if (!attacker || attacker.hp <= 0) return;

    if (type === 'defend') {
        selectedAction = null;
        attacker.isGuarding = true;
        logMessage(`🛡️ <b>${attacker.name}</b> ตั้งท่าป้องกัน จะได้รับความเสียหายลดลงครึ่งหนึ่งจากการโจมตีครั้งถัดไป`);
        renderBattleArena();
        switchTurn();
        return;
    }

    if (type === 'special' && attacker.energy < 100) {
        logMessage(`⚠️ <b>${attacker.name}</b> ยังมีพลังงานไม่พอใช้สกิลพิเศษ`);
        return;
    }

    selectedAction = type;
    renderBattleArena();
}

function userSelectTarget(enemyIndex) {
    if (currentTurn !== 'player' || isBattleOver || !selectedAction) return;
    const target = enemyTeamState[enemyIndex];
    const attacker = playerTeamState[activeAttackerIndex];

    if (attacker && target && target.hp > 0) {
        const useSpecial = selectedAction === 'special';
        selectedAction = null;
        executeAttack(attacker, target, useSpecial);
    }
}

function switchTurn() {
    if (currentTurn === 'player') {
        selectedAction = null;
        currentTurn = 'enemy';
        renderBattleArena();
        setTimeout(runEnemyTurn, 1000);
    } else {
        currentTurn = 'player';
        // วนหาตัวละครฝั่งเราที่ยังไม่ตายตัวถัดไป
        do {
            activeAttackerIndex = (activeAttackerIndex + 1) % playerTeamState.length;
        } while (playerTeamState[activeAttackerIndex].hp <= 0 && playerTeamState.some(p => p.hp > 0));

        renderBattleArena();
        if (isAutoBattle) {
            setTimeout(runAutoBattleTurn, 700);
        }
    }
}

// AI ศัตรู
function runEnemyTurn() {
    if (isBattleOver) return;

    const aliveEnemies = enemyTeamState.filter(e => e.hp > 0);
    const alivePlayers = playerTeamState.filter(p => p.hp > 0);

    if (aliveEnemies.length > 0 && alivePlayers.length > 0) {
        const attacker = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        const guardingPlayers = alivePlayers.filter(player => player.isGuarding);
        const targets = guardingPlayers.length ? guardingPlayers : alivePlayers;
        const target = targets[Math.floor(Math.random() * targets.length)];
        const useSpecial = attacker.energy >= 100;
        const wasGuarding = target.isGuarding;

        if (wasGuarding) {
            const damage = useSpecial ? Math.round(attacker.atk * 1.8) : attacker.atk;
            const reducedDamage = Math.ceil(damage / 2);
            target.hp = Math.max(0, target.hp - reducedDamage);
            target.isGuarding = false;

            if (useSpecial) {
                attacker.energy = 0;
            } else {
                attacker.energy = Math.min(100, attacker.energy + 35);
            }
            target.energy = Math.min(100, target.energy + 20);

            const skillName = useSpecial ? `ใช้สกิลพิเศษ [${attacker.specialName}]` : 'โจมตีปกติ';
            logMessage(`🛡️ <b>${target.name}</b> ป้องกันการโจมตีของ <b>${attacker.name}</b> (${skillName}) ลดความเสียหายเหลือ <b style="color:#38bdf8;">${reducedDamage}</b> หน่วย!`);
            renderBattleArena();
            checkGameOver();
            if (!isBattleOver) {
                switchTurn();
            }
        } else {
            executeAttack(attacker, target, useSpecial);
        }
    }
}

function toggleAutoBattle() {
    if (isBattleOver) return;

    isAutoBattle = !isAutoBattle;
    if (isAutoBattle) {
        selectedAction = null;
    }
    updateAutoBattleButton();
    renderBattleArena();

    if (isAutoBattle && currentTurn === 'player') {
        runAutoBattleTurn();
    }
}

function updateAutoBattleButton() {
    const button = document.getElementById('autoBtn');
    if (!button) return;

    button.className = isAutoBattle ? 'auto-btn active' : 'auto-btn';
    button.textContent = isAutoBattle
        ? '⚡ ต่อสู้ออโต้: ON (กดเพื่อปิด)'
        : '⚡ ต่อสู้ออโต้: OFF';
}

function runAutoBattleTurn() {
    if (!isAutoBattle || currentTurn !== 'player' || isBattleOver) return;

    const attacker = playerTeamState[activeAttackerIndex];
    const target = enemyTeamState
        .filter(enemy => enemy.hp > 0)
        .reduce((lowestHpEnemy, enemy) => !lowestHpEnemy || enemy.hp < lowestHpEnemy.hp ? enemy : lowestHpEnemy, null);

    if (!attacker || attacker.hp <= 0 || !target) return;

    executeAttack(attacker, target, attacker.energy >= 100);
}

function checkGameOver() {
    const playerDead = playerTeamState.every(p => p.hp <= 0);
    const enemyDead = enemyTeamState.every(e => e.hp <= 0);

    if (playerDead || enemyDead) {
        isBattleOver = true;
        if (enemyDead) {
            logMessage('<h3 style="color:#10b981; margin:5px 0;">🎉 ยินดีด้วย! ทีมของคุณเป็นฝ่ายชนะ!</h3>');
            showBattleResult(true);
        } else {
            logMessage('<h3 style="color:#f43f5e; margin:5px 0;">💀 พ่ายแพ้! ทีมศัตรูเป็นฝ่ายชนะ!</h3>');
            showBattleResult(false);
        }
        return true;
    }
    return false;
}

function showBattleResult(isVictory) {
    const modal = document.getElementById('battleResultModal');
    const content = document.getElementById('battleResultContent');
    const title = document.getElementById('battleResultTitle');
    const message = document.getElementById('battleResultMessage');

    content.className = `result-modal-content ${isVictory ? 'victory' : 'defeat'}`;
    title.textContent = isVictory ? '🎉 ชนะการต่อสู้!' : '💀 แพ้การต่อสู้';
    message.textContent = isVictory
        ? 'ทีมของคุณเอาชนะทีมศัตรูได้สำเร็จ!'
        : 'ทีมของคุณพ่ายแพ้ในการต่อสู้ ลองจัดทีมใหม่แล้วกลับมาอีกครั้ง!';
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
}

function closeBattleResult() {
    const modal = document.getElementById('battleResultModal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

function logMessage(msg) {
    const logBox = document.getElementById('battleLog');
    logBox.innerHTML += `<div>${msg}</div>`;
    logBox.scrollTop = logBox.scrollHeight;
}

function closeBattleModal() {
    closeBattleResult();
    document.getElementById('battleModal').style.display = 'none';
    isAutoBattle = false;
    updateAutoBattleButton();
}

// MOCK DATA (สำหรับทดสอบโดยไม่ผ่าน Server)
function getMockData() {
    return [
        { id: 1, name: "Twilight Sparkle", kind: ["Alicorn"], occupation: "Princess of Friendship", image: ["https://vignette.wikia.nocookie.net/mlp/images/c/bc/FANMADE_Twilight_Sparkle_Transparent.png"] },
        { id: 2, name: "Rainbow Dash", kind: ["Pegasus"], occupation: "Wonderbolt Trainee", image: ["https://vignette.wikia.nocookie.net/mlp/images/4/4b/FANMADE_Rainbow_Dash_Transparent.png"] },
        { id: 3, name: "Pinkie Pie", kind: ["Earth Pony"], occupation: "Baker / Party Planner", image: ["https://vignette.wikia.nocookie.net/mlp/images/b/b2/FANMADE_Pinkie_Pie_Transparent.png"] },
        { id: 4, name: "Rarity", kind: ["Unicorn"], occupation: "Fashion Designer", image: ["https://vignette.wikia.nocookie.net/mlp/images/d/d1/FANMADE_Rarity_Transparent.png"] },
        { id: 5, name: "Applejack", kind: ["Earth Pony"], occupation: "Apple Farmer", image: ["https://vignette.wikia.nocookie.net/mlp/images/d/d8/FANMADE_Applejack_Transparent.png"] }
    ];
}

// =========================================================
// EVENT LISTENERS & INITIALIZATION
// =========================================================
document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    renderCharactersGrid();
});
document.getElementById('seasonSort').addEventListener('change', () => {
    currentPage = 1;
    renderCharactersGrid();
});
document.getElementById('characterSort').addEventListener('change', () => {
    currentPage = 1;
    renderCharactersGrid();
});
document.getElementById('clearTeamBtn').addEventListener('click', clearSelectedTeam);
const scrollToTopButton = document.getElementById('scrollToTopBtn');
window.addEventListener('scroll', () => {
    scrollToTopButton.hidden = window.scrollY < 200;
});
scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.getElementById('previousPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage -= 1;
        renderCharactersGrid();
    }
});
document.getElementById('nextPageBtn').addEventListener('click', () => {
    currentPage += 1;
    renderCharactersGrid();
});
document.getElementById('characterModal').addEventListener('click', event => {
    if (event.target === event.currentTarget) {
        closeCharacterDetails();
    }
});
document.getElementById('battleResultModal').addEventListener('click', event => {
    if (event.target === event.currentTarget) {
        closeBattleResult();
    }
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeCharacterDetails();
        closeBattleResult();
    }
});
loadCharacters();