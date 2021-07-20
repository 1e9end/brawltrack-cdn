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

const alps = ["a", "b", "c", "d", "e", "f", "g"];
function p(name, trophies, start, role, a, b, c, d, e, f, g, color){
	let r;
	switch(role){
		case "member":
			r = "Member";
		break;
		case "senior":
			r = "Senior";
		break;
		case "vicePresident":
			r = "VP";
		break;
		case "president":
			r = "President";
		break;
		case "CLUB":
			r = "Club";
	}
	return {
		name: name,
		role: r,
		trophies: trophies,
		a: a == -1 ? "TBD": a - start,
		b: b == -1 ? "TBD": b - a,
		c: c == -1 ? "TBD": c - b,
		d: d == -1 ? "TBD": d - c, 
		e: e == -1 ? "TBD": e - d,
		f: f == -1 ? "TBD": f - e,
		g: g == -1 ? "TBD": g - f,
		raw: trophies - start,
		total: trophies - start + compensation(trophies - start, trophies),
		start: start,
		//ballots: tally(trophies - start, trophies) 
		//color: color,
	};
}

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

function changeClub(){
	var club = document.getElementById("club").value;
	$.ajax({
		url: 'https://bb-trophytracker.herokuapp.com/' + club,
		type: "GET",
		accept: "application/json",
		async: false
	}).done(res => {
		update(res);
		console.log("Successfully loaded " + club + "'s club info from server");
	});
}

document.getElementById("club").value = "BetterBrawlers";
changeClub();