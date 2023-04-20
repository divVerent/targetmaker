function toPx(w) {
  let n = document.getElementById('unit_converter');
  n.style.width = w;
  return parseFloat(window.getComputedStyle(n).width);
}

const preamble = `
macro B-2
ringcolor black
innercolor white
textcolor black
ring 7.33in 4
ring 5.56in 5
ring 4.16in 6
ringcolor red
innercolor black
textcolor white
ring 3.07in 7
ring 2.23in 8
ring 1.54in 9
ring 0.90in 10
textcolor black
end

macro B-3
ringcolor black
innercolor white
textcolor black
ring 8.32in 6
ring 6.14in 7
ring 4.46in 8
ringcolor red
innercolor black
textcolor white
ring 3.06in 9
ring 1.80in 10
ring 0.90in X
textcolor black
end
`;

function onClick(ev) {
  ev.preventDefault();

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
  let ringColor = 'black';
  let innerColor = 'grey';
  let textColor = 'black';

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
      unit = toPx(args[1]);
      break;
    case 'paper':
      paperX = toPx(args[1]);
      paperY = toPx(args[2]);
      break;
    case 'linewidth':
      lineWidth = toPx(args[1]);
      break;
    case 'fontsize':
      fontSize = toPx(args[1]);
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
      centerX = toPx(args[1]);
      centerY = toPx(args[2]);
      break;
    case 'ringscale':
      ringScale = args[1];
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
      let d = toPx(args[1]);
      let t = args.slice(2).join(' ');
      let circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', centerX / unit);
      circle.setAttribute('cy', centerY / unit);
      circle.setAttribute('r', d * ringScale / (2 * unit));
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
      text.setAttribute('y', (centerY + d * ringScale / 2 - lineWidth) / unit);
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
  document.getElementById('make_svg').addEventListener('click', onClick);
}

window.addEventListener('load', onLoad);
