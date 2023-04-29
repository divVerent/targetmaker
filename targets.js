function toPx(w, distance) {
  let result = /^(\d*\.?\d*)(\w+)$/.exec(w);
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
  return (baseValue + caliberFrom / 2) * scale - caliberTo / 2;
}

const preamble = `
macro B-2
ringcolor black
innercolor white
textcolor black
ring 7.33in@50ft 4@mm
ring 5.56in@50ft 5
ring 4.16in@50ft 6
ringcolor red
innercolor black
textcolor white
ring 3.07in@50ft 7
ring 2.23in@50ft 8
ring 1.54in@50ft 9
ring 0.90in@50ft 10
textcolor black
end

macro B-3
ringcolor black
innercolor white
textcolor black
ring 8.32in@50ft 6@mm
ring 6.14in@50ft 7
ring 4.46in@50ft 8
ringcolor red
innercolor black
textcolor white
ring 3.06in@50ft 9
ring 1.80in@50ft 10
ring 0.90in@50ft X
textcolor black
end

macro mil@15m
ringcolor black
innercolor white
textcolor black
ring 18cm 6mil@mm
ring 15cm 5mil
ring 12cm 4mil
ringcolor red
innercolor black
textcolor white
ring 9cm 3mil
ring 6cm 2mil
ring 3cm 1mil
textcolor black
end

macro mil@15m-small
ringcolor black
innercolor white
textcolor black
ring 6cm 2mil@mm
ring 4.5cm 1.5mil
ringcolor red
innercolor black
textcolor white
ring 3cm 1mil
ring 1.5cm 0.5mil
textcolor black
end

macro mil@25m
ringcolor black
innercolor white
textcolor black
ring 20cm 4mil@mm
ring 17.5cm 3.5mil
ring 15cm 3mil
ring 12.5cm 2.5mil
ringcolor red
innercolor black
textcolor white
ring 10cm 2mil
ring 7.5cm 1.5mil
ring 5cm 1mil
ring 2.5cm 0.5mil
textcolor black
end

macro mil@50m
ringcolor black
innercolor white
textcolor black
ring 20cm 2mil@mm
ring 18cm 1.8mil
ring 16cm 1.6mil
ring 14cm 1.4mil
ring 12cm 1.2mil
ringcolor red
innercolor black
textcolor white
ring 10cm 1mil
ring 8cm 0.8mil
ring 6cm 0.6mil
ring 4cm 0.4mil
ring 2cm 0.2mil
textcolor black
end

macro moa@50ft
ringcolor black
innercolor white
textcolor black
ring 8in 24moa@mm
ring 7in 21moa
ring 6in 18moa
ring 5in 15moa
ringcolor red
innercolor black
textcolor white
ring 4in 12moa
ring 3in 9moa
ring 2in 6moa
ring 1in 3moa
textcolor black
end

macro moa@25yd
ringcolor black
innercolor white
textcolor black
ring 8in 16moa@mm
ring 7in 14moa
ring 6in 12moa
ring 5in 10moa
ringcolor red
innercolor black
textcolor white
ring 4in 8moa
ring 3in 6moa
ring 2in 4moa
ring 1in 2moa
textcolor black
end

macro moa@50yd
ringcolor black
innercolor white
textcolor black
ring 8in 8moa@mm
ring 7in 7moa
ring 6in 6moa
ring 5in 5moa
ringcolor red
innercolor black
textcolor white
ring 4in 4moa
ring 3in 3moa
ring 2in 2moa
ring 1in 1moa
textcolor black
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
  let centerX = paperX / 2;
  let centerY = paperY / 2;
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
    case 'ringcaliber':
      ringCaliberFrom = toPx(args[1], null);
      ringCaliberTo = toPx(args[2], null);
      break;
    case 'color':
      ringColor = args[1];
      innerColor = args[2];
      textColor = args[3];
      break;
    case 'ringcolor':
      ringColor = args[1];
      break;
    case 'innercolor':
      innerColor = args[1];
      break;
    case 'textcolor':
      textColor = args[1];
      break;
    case 'ring': {
      let d = toPxAdjusted(args[1], ringScale, distance, ringCaliberFrom, ringCaliberTo);
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
  svg.setAttribute('viewBox', '0 0 ' + (paperX / unit) + ' ' + (paperY / unit));
  document.body.appendChild(svg);
}

function onLoad() {
  document.getElementById('target_spec').addEventListener('change', onChange);
  render();
}

window.addEventListener('load', onLoad);
