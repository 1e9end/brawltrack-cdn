var navOn = false;
function toggleNav() {
	if (!navOn){
		document.getElementById("sidenav").style.width = "250px";
		navOn = true;
		return;
	}

	document.getElementById("sidenav").style.width = "0";
	navOn = false;
}

var clubInfo;

function compensation(gains, trophies){
	return gains > 0 ? Math.floor(trophies/1000) * 25:0;
}

function tally(gains, trophies){
	var d;
	if (trophies < 10000){
		d = 400;
	}
	else if (trophies < 20000){
		d = 300;
	}
	else if (trophies < 30000){
		d = 200;
	}
	else{
		d = 100;
	}

	return Math.max(Math.floor(gains/d), 0);
}

function getLuminosity(k){
	var c = k.substring(1);      // strip #
	var rgb = parseInt(c, 16);   // convert rrggbb to decimal
	var r = (rgb >> 16) & 0xff;  // extract red
	var g = (rgb >>  8) & 0xff;  // extract green
	var b = (rgb >>  0) & 0xff;  // extract blue

	return (r + g + b)/255; // per ITU-R BT.709
}

function p(member){
	let r;
	switch(member.role){
		case "member":
			r = "Member";
		break;
		case "senior":
			r = "Senior";
		break;
		case "vicePresident":
			r = "Vice President";
		break;
		case "president":
			r = "President";
		break;
		case "CLUB":
			r = "Club";
	}
	let ans = {
		name: member.name,
		role: r,
		start: member.start,
		trophies: member.trophies,
		stats: [],
		raw: member.trophies - member.start,
		total: member.trophies - member.start + compensation(member.trophies - member.start, member.trophies),
		icon: member.icon,
		color: member.nameColor,
		// ballots: tally(trophies - start, trophies) 
	};

	let last = member.start;
	for (let i = 0; i < member.stats.length; ++i){
		let v = member.stats[i];
		if (v == -1){
			ans.stats.push("TBD");
			continue;
		}

		ans.stats.push(v - last);
		last = v;
	}

	return ans;
}



/**
function createCell(txt, bold){
	let box = document.createElement("TD");
	let node = document.createTextNode(txt);
	if (bold){
		box.style = "font-weight: bold;";
	}
	box.appendChild(node);
	return box;
}
function update(clubInfo){
	let info = [];
	let total = 0;
	let c;
	for (let i in clubInfo){
		let member = clubInfo[i];
		if (member.role == "CLUB"){
			c = p(member.name, member.trophies, member.start, member.role, member.monday, member.tuesday, member.wednesday, member.thursday, member.friday, member.saturday, member.sunday, member.nameColor);
			continue;
		}
		info.push(p(member.name, member.trophies, member.start, member.role, member.monday, member.tuesday, member.wednesday, member.thursday, member.friday, member.saturday, member.sunday, member.nameColor));
		total += member.trophies - member.start;
	}

	info.sort(function (a, b){
		return b.total - a.total;
	});

	let leaderboard = document.querySelector(".leaderboard");
	leaderboard.innerHTML = `<tr><th>Rank</th><th>Member</th><th>Role</th><th>Trophies</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th><th>Sunday</th><th>Raw Gains</th><th>Adjusted Gains</th></tr>`;
	for (let i = 0; i < info.length; ++i){
		let player = info[i];
		let node = document.createElement("TR");
		node.appendChild(createCell(i + 1));
		let k = 0;
		for (let n in player){
			if (k == 12){
				++k;
				continue;
			}
			node.appendChild(createCell(player[n], (k == 0 || k == 11)));
			++k;
		}
		leaderboard.appendChild(node);
	}

	document.getElementById("club-gains").innerHTML = ``;
	let node = document.createElement("TR");
	let k = 0;
	for (let n in c){
		if (k == 11){
			node.appendChild(createCell("PUSH: " + total, true));
			break;
		}
		node.appendChild(createCell((k == 10 ? "RAW: ":"") + c[n], (k == 0 || k == 10)));
		++k;
	}
	document.getElementById("club-gains").appendChild(node);
};
**/

function createDiv(c, text){
	let x = document.createElement("DIV");
	x.className = c;
	let s = document.createElement("SPAN");
	s.textContent = text;
	x.appendChild(s);
	return x;
}
function createMemberDiv(rank, member){
	let d = document.createElement("DIV");
	d.className = "member";

	d.appendChild(createDiv("member-rank", rank));

	if (member.icon){
		let x = document.createElement("DIV");
		x.className = "member-icon-wrapper";

		let icon = document.createElement("IMG");
		icon.src = `https://cdn.brawlify.com/profile/${member.icon}.png`;
		icon.className = "member-icon";

		x.appendChild(icon);
		d.appendChild(x);
	}

	let nd = document.createElement("DIV");
	nd.className = "member-name-wrapper";

	let n = createDiv("member-name", member.name);
	let c = member.color?.substring(4);
	n.style.color = "#" + c;
	let r = createDiv("member-role", member.role);
	nd.appendChild(n);
	nd.appendChild(r);
	d.appendChild(nd);

	d.appendChild(createDiv("member-stats", member.trophies));
	for (let i = 0; i < member.stats.length; ++i){
		d.appendChild(createDiv("member-stats", member.stats[i]));
	}

	d.appendChild(createDiv("member-stats", member.raw));
	d.appendChild(createDiv("member-stats", member.total));

	return d;
}

function updateClub(clubDetails){
	document.getElementById("club-badge").src = `https://cdn.brawlify.com/club/${clubDetails.badgeId}.png`;
	document.getElementById("club-name").textContent = clubDetails.name;
	document.getElementById("club-tag").textContent = clubDetails.tag;
	document.getElementById("club-description").textContent = clubDetails.description;
	document.getElementById("club-required-trophies").textContent = clubDetails.requiredTrophies;
	let n = clubDetails.type;
	document.getElementById("club-type").textContent = clubDetails.type.split(/(?=[A-Z])/).join(" ").toUpperCase();
}

function update(clubInfo){
	document.getElementById("leaderboard").innerHTML = ``;
	let m = [];
	for (let i = 0; i < clubInfo.length; ++i){
		if (clubInfo[i].role == "CLUB"){
			updateClub(clubInfo[i]);
			continue;
		}
		m.push(p(clubInfo[i]));
	}

	m.sort((a, b)=>{
		return b.total - a.total;
	})
	for (let i = 0; i < m.length; ++i){
		document.getElementById("leaderboard").appendChild(createMemberDiv(i + 1, m[i]));
	}

	let scrollbar = document.getElementById("leaderboard").offsetWidth - document.getElementById("leaderboard").clientWidth;
	document.getElementById("leaderboard-header").style.paddingRight = `${scrollbar}px`;
}

function changeClub(){
	var club = document.getElementById("club").value;
	$.ajax({
		url: 'https://bb-trophytracker.herokuapp.com/' + club,
		type: "GET",
		accept: "application/json",
		async: false
	}).done(res => {
		update(res);
	});
}

document.getElementById("club").value = "BetterBrawlers";
changeClub();