export function createDebugOverlay(parent = document.body) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.right = '12px';
  container.style.top = '12px';
  container.style.padding = '8px 12px';
  container.style.background = 'rgba(0,0,0,0.7)';
  container.style.color = '#bfefff';
  container.style.fontFamily = 'monospace';
  container.style.fontSize = '11px';
  container.style.borderRadius = '8px';
  container.style.zIndex = 99999;
  container.style.pointerEvents = 'none';
  container.style.lineHeight = '1.4';
  container.innerHTML = `<div style="min-width:200px">
    <div style="color:#7df0ff; font-weight:bold; margin-bottom:4px;">Physical Engine Debug</div>
    <div class="dbg-mode">Mechanic: -</div>
    <div class="dbg-pos">Position: -, - units</div>
    <div class="dbg-vel">Velocity: -, - u/t</div>
    <div class="dbg-g">Grounded: -</div>
    <div class="dbg-alive">Alive: -</div>
    <div class="dbg-gravity">Gravity: -</div>
    <div class="dbg-meta">Obstacles: -</div>
  </div>`;
  parent.style.position = parent.style.position || 'relative';
  parent.appendChild(container);
  return {
    update(state, meta) {
      container.querySelector('.dbg-mode').textContent = `Mechanic: ${state.mode}`;
      container.querySelector('.dbg-pos').textContent = `Position: ${state.x}, ${state.y} units`;
      container.querySelector('.dbg-vel').textContent = `Velocity: ${state.vx.toFixed(2)}, ${state.vy.toFixed(2)} u/t`;
      container.querySelector('.dbg-g').textContent = `Grounded: ${state.grounded ? 'yes' : 'no'}`;
      container.querySelector('.dbg-alive').textContent = `Alive: ${state.alive ? 'yes' : 'no'}`;
      container.querySelector('.dbg-gravity').textContent = `Gravity: ${state.gravitySign > 0 ? '↓' : '↑'}`;
      container.querySelector('.dbg-meta').textContent = `Obstacles: ${meta.obstacles}`;
    },
    destroy() {
      container.remove();
    },
  };
}
