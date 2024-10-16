function toPx(w, distance) {
  let result = /^([-+]?\d*\.?\d*)([a-z]+)$/.exec(w);
  if (result == null) {
    console.error("could not find unit: " + w);
    return 0;
  }
  let amount = parseFloat(result[1]);
  let unit = result[2];
  switch (unit) {
  case "px":
    return amount;
  case "in":
    return amount * 96;
  case "pt":
    return amount * 96 / 72;
  case "ft":
    return amount * 96 * 12;
  case "yd":
    return amount * 96 * 36;
  case "mm":
    return amount * 96 / 25.4;
  case "cm":
    return amount * 96 / 25.4 * 10;
  case "m":
    return amount * 96 / 25.4 * 1000;
  case "mil":
    return amount * distance / 1000;
  case "moa":
    return amount * distance / 3600;
  default:
    console.error("could not recognize unit: " + w);
    return 0;
  }
}

function toColor(colors, color) {
  if (colors[color] != null) {
    return colors[color];
  }
  return color;
}

function nicePrint(val) {
  if (val >= 100) {
    return val.toFixed(0);
  }
  if (val >= 10) {
    return val.toFixed(1);
  }
  return val.toFixed(2);
}

// TODO: also accept angles in form 5in@100ft.
// Then scale them according to caliber.
// This assumes that this is a diameter, not a radius!
// I.e.:
// 1. Expand by caliber.
// 2. Scale.
// 3. Contract by caliber.
function toPxAdjusted(w, scale, distance, caliberFrom, caliberTo) {
  let result = /^([^@]*)(?:@(.*))?$/.exec(w);
  if (result == null) {
    console.error("could not find separation: " + w);
    return 0;
  }
  let baseValue = toPx(result[1], distance);
  if (result[2] != null) {
    let baseDistance = toPx(result[2], null);
    scale *= distance / baseDistance;
  }
  return (baseValue + caliberFrom) * scale - caliberTo;
}

const preamble = `
macro B-2
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 7.33in@50ft 4@mm
ring 5.56in@50ft 5
ring 4.16in@50ft 6
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 3.07in@50ft 7
ring 2.23in@50ft 8
ring 1.54in@50ft 9
ring 0.90in@50ft 10
textcolor black
end

macro B-3
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 8.32in@50ft 6@mm
ring 6.14in@50ft 7
ring 4.46in@50ft 8
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 3.06in@50ft 9
ring 1.80in@50ft 10
ring 0.90in@50ft X
textcolor black
end

macro SR
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 37in@200yd 5@mm
ring 31in@200yd 6
ring 25in@200yd 7
ring 19in@200yd 8
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 13in@200yd 9
ring 7in@200yd 10
ring 3in@200yd X
textcolor black
end

macro SR-3
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 37in@300yd 5@mm
ring 31in@300yd 6
ring 25in@300yd 7
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 19in@300yd 8
ring 13in@300yd 9
ring 7in@300yd 10
ring 3in@300yd X
textcolor black
end

macro MR-1
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 60in@600yd 5@mm
ring 48in@600yd 6
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 36in@600yd 7
ring 24in@600yd 8
ring 18in@600yd 9
ring 12in@600yd 10
ring 6in@600yd X
textcolor black
end

macro 6mil/6
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 6mil 6mil@mm
ring 5mil 5mil
ring 4mil 4mil
ring 3mil 3mil
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 2mil 2mil
ring 1mil 1mil
textcolor black
end

macro 2mil/4
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 2mil 2mil@mm
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 1.5mil 1.5mil
ring 1mil 1mil
ring 0.5mil 0.5mil
textcolor black
end

macro 4mil/8
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 4mil 4mil@mm
ring 3.5mil 3.5mil
ring 3mil 3mil
ring 2.5mil 2.5mil
ring 2mil 2mil
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 1.5mil 1.5mil
ring 1mil 1mil
ring 0.5mil 0.5mil
textcolor black
end

macro 2mil/10
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 2mil 2mil@mm
ring 1.8mil 1.8mil
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 1.6mil 1.6mil
ring 1.4mil 1.4mil
ring 1.2mil 1.2mil
ring 1mil 1mil
ring 0.8mil 0.8mil
ring 0.6mil 0.6mil
ring 0.4mil 0.4mil
ring 0.2mil 0.2mil
textcolor black
end

macro 24moa/8
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 24moa 24moa@mm
ring 21moa 21moa
ring 18moa 18moa
ring 15moa 15moa
ring 12moa 12moa
ring 9moa 9moa
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 6moa 6moa
ring 3moa 3moa
textcolor black
end

macro 16moa/8
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 16moa 16moa@mm
ring 14moa 14moa
ring 12moa 12moa
ring 10moa 10moa
ring 8moa 8moa
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 6moa 6moa
ring 4moa 4moa
ring 2moa 2moa
textcolor black
end

macro 8moa/8
ringcolor $target_ring
innercolor $target_inner
textcolor $target_text
ring 8moa 8moa@mm
ring 7moa 7moa
ringcolor $bullseye_ring
innercolor $bullseye_inner
textcolor $bullseye_text
ring 6moa 6moa
ring 5moa 5moa
ring 4moa 4moa
ring 3moa 3moa
ring 2moa 2moa
ring 1moa 1moa
textcolor black
end

# Ready-made pages to print on Letter.
macro PrecisionPistol@25ft
targetcaliber .22in
center 2in -5in
text Precision Pistol @ 25ft
distance 25ft
center -2in -3.25in
use B-2
center -2in -1.25in
text Slow Fire
center 2in 0in
use B-3
center 2in 2.25in
text Timed Fire
center -2in 3.25in
use B-3
center -2in 1in
text Rapid Fire
end

macro PrecisionPistol@10m
targetcaliber .22in
center 0in -5.25in
text Precision Pistol @ 10m
distance 10m
center 0in -2.75in
use B-2
center 0in -0.25in
text Slow Fire
center 0in 2.75in
use B-3
center 0in 0in
text Timed+Rapid Fire
end

macro HighPowerRifle@50ft
distance 50ft
targetcaliber .30in
center -2.125in -3.667in
use SR
center 2.125in -3.667in
use SR
center 0in -3.834in
text standing slow  10
center 0in -3.5in
text sitting rapid 10
center -2.125in 0in
use SR-3
center 2.125in 0in
use SR-3
center 0in 0in
text prone rapid 10
center -2.125in 3.667in
use MR-1
center 2.125in 3.667in
use MR-1
center 0in 3.667in
text prone slow 20
end

macro HighPowerRifle@25yd
distance 25yd
targetcaliber .30in
center 0in -2.5in
use SR
center -3.25in -2.5in
text standing slow 10
center 3.25in -2.5in
text sitting rapid 10
center -2.125in 1in
use SR-3
center 2.125in 1in
use SR-3
center -in 1in
text prone rapid 10
center -2.125in 4in
use MR-1
center 2.125in 4in
use MR-1
center 0in 4in
text prone slow 20
end

macro Six@50ft
distance 50ft
center -2in -4in
use 4mil/8
center 2in -4in
use 4mil/8
center -2in 0in
use 4mil/8
center 2in 0in
use 4mil/8
center -2in 4in
use 4mil/8
center 2in 4in
use 4mil/8
end
`;

function onChange(ev) {
  render();
}

function render() {
  let macros = {};

  let svgPrev = document.getElementById('target_svg');
  if (svgPrev != null) {
    svgPrev.parentNode.removeChild(svgPrev);
  }

  let str = document.getElementById('target_spec').value;
  let ns = 'http://www.w3.org/2000/svg';
  let svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('id', 'target_svg');

  const mm = 96 / 25.4;

  // All values here are in px.
  let unit = 1 * mm;
  let paperX = 297 * mm;
  let paperY = 210 * mm;
  let centerX = 0;
  let centerY = 0;
  let lineWidth = 1 * mm;
  let fontSize = 10 * mm;

  // Info for drawing rings.
  let ringScale = 1;
  let ringCaliberFrom = 0;
  let ringCaliberTo = 0;
  let ringColor = 'black';
  let innerColor = 'grey';
  let textColor = 'black';
  let distance = toPx('50ft', null);

  let stack = (preamble + str).split(/\r?\n/).reverse();

  let recordToMacro = null;

  let colors = {
    '$target_ring': 'black',
    '$target_inner': 'white',
    '$target_text': 'black',
    '$bullseye_ring': 'red',
    '$bullseye_inner': 'black',
    '$bullseye_text': 'white',
  };

  while (stack.length > 0) {
    let l = stack.pop();
    let args = l.split(/\s+/).filter(x => x != '');
    if (args.length == 0) {
      continue;
    }
    if (recordToMacro != null) {
      if (args[0] == 'end') {
        recordToMacro = null;
      } else {
        macros[recordToMacro].push(l);
      }
      continue;
    }
    switch (args[0]) {
    case 'macro':
      recordToMacro = args[1];
      macros[recordToMacro] = [];
      break;
    case 'use': {
      // Push macro content in reverse order.
      let m = macros[args[1]];
      if (m == null) {
        alert('unknown macro: ' + args[1]);
        break;
      }
      for (let i = m.length - 1; i >= 0; i--) {
        stack.push(m[i]);
      }
      break;
    }
    case 'unit':
      unit = toPx(args[1], null);
      break;
    case 'paper':
      paperX = toPx(args[1], null);
      paperY = toPx(args[2], null);
      break;
    case 'linewidth':
      lineWidth = toPx(args[1], null);
      break;
    case 'fontsize':
      fontSize = toPx(args[1], null);
      break;
    case 'text': {
      let t = args.slice(1).join(' ');
      let text = document.createElementNS(ns, 'text');
      text.setAttribute('font-size', fontSize / unit);
      text.setAttribute('stroke', 'none');
      text.setAttribute('fill', textColor);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('x', centerX / unit);
      text.setAttribute('y', centerY / unit);
      text.setAttribute('alignment-baseline', 'middle');
      let str = document.createTextNode(t);
      text.appendChild(str);
      svg.appendChild(text);
      break;
    }
    case 'center':
      centerX = toPx(args[1], null);
      centerY = toPx(args[2], null);
      break;
    case 'distance':
      distance = toPx(args[1], null);
      break;
    case 'ringscale':
      if (args.length > 2) {
        ringScale = toPx(args[1], null) / toPx(args[2], null);
      } else {
        ringScale = args[1];
      }
      break;
    case 'targetcaliber':
      ringCaliberFrom = toPx(args[1], null);
      break;
    case 'guncaliber':
      ringCaliberTo = toPx(args[1], null);
      break;
    case 'ringcolor':
      ringColor = toColor(colors, args[1]);
      break;
    case 'innercolor':
      innerColor = toColor(colors, args[1]);
      break;
    case 'textcolor':
      textColor = toColor(colors, args[1]);
      break;
    case 'color':
      colors[args[1]] = toColor(colors, args[2]);
      break;
    case 'ring': {
      // Note: d is a diameter.
      let d = toPxAdjusted(args[1], ringScale, distance, ringCaliberFrom, ringCaliberTo);
      d -= lineWidth;
      if (d <= 0) {
        break;
      }
      let t = args.slice(2).join(' ');
      let result = /(.*)@(\w+)/.exec(t);
      if (result != null) {
        let prefix = result[1];
        let unit = result[2];
        let unitValue = toPx('1' + unit, ringScale * distance);
        let amount = d / unitValue;
        t = result[1] + '@' + nicePrint(amount) + unit;
      }
      let circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', centerX / unit);
      circle.setAttribute('cy', centerY / unit);
      circle.setAttribute('r', d / (2 * unit));
      circle.setAttribute('stroke', ringColor);
      circle.setAttribute('stroke-width', lineWidth / unit);
      circle.setAttribute('fill', innerColor);
      svg.appendChild(circle);
      let text = document.createElementNS(ns, 'text');
      text.setAttribute('font-size', fontSize / unit);
      text.setAttribute('stroke', 'none');
      text.setAttribute('fill', textColor);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('x', centerX / unit);
      text.setAttribute('y', (centerY + d / 2 - lineWidth) / unit);
      text.setAttribute('alignment-baseline', 'bottom');
      let str = document.createTextNode(t);
      text.appendChild(str);
      svg.appendChild(text);
      break;
    }
    case '#':
    case '//':
    case '--':
    case 'dnl':
      break;
    default:
      alert('unknown command: ' + args[0]);
      break;
    }
  }
  svg.setAttribute('width', paperX + 'px');
  svg.setAttribute('height', paperY + 'px');
  svg.setAttribute('viewBox', (-paperX * 0.5 / unit) + ' ' + (-paperY * 0.5 / unit) + ' ' + (paperX / unit) + ' ' + (paperY / unit));
  document.body.appendChild(svg);
}

function onLoad() {
  document.getElementById('target_spec').addEventListener('change', onChange);
  render();
}

window.addEventListener('load', onLoad);
