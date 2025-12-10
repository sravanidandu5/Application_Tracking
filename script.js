// enhanced UI interactions with edit/delete + in-memory storage
document.addEventListener('DOMContentLoaded', function() {
  const landing = document.getElementById('landing');
  const app = document.getElementById('app');
  const loginBtn = document.getElementById('loginBtn');
  const exitBtn = document.getElementById('exitBtn');
  const actionCards = document.querySelectorAll('.action-card');
  const panels = document.querySelectorAll('.panel');

  // in-memory apps list for demo
  const apps = [];
  let nextId = 1;        // simple id generator
  let editingId = null;  // current id being edited (null = creating new)

  // helpers
  function showLanding(){ landing.classList.remove('hidden'); app.classList.add('hidden'); }
  function showApp(){ landing.classList.add('hidden'); app.classList.remove('hidden'); openPanel(null); renderApps(); }

  // open a panel by id (or close all if null)
  function openPanel(id){
    panels.forEach(p => {
      if(id && p.id === id) p.classList.toggle('hidden');
      else p.classList.add('hidden');
    });
  }

  // escape helper
  function escapeHtml(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // render table from apps array
  function renderApps(){
    const tbody = document.querySelector('#appsTable tbody');
    tbody.innerHTML = '';
    apps.forEach(a => {
      const tr = document.createElement('tr');

      tr.appendChild(cell(escapeHtml(a.company)));
      tr.appendChild(cell(escapeHtml(a.role)));
      tr.appendChild(cell(escapeHtml(a.location)));
      tr.appendChild(cell(escapeHtml(a.status)));
      tr.appendChild(cell(escapeHtml(a.date)));
      tr.appendChild(cell(escapeHtml(a.notes)));

      const actions = document.createElement('td');

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-sm btn-warning';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => startEdit(a.id));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-sm btn-danger';
      delBtn.textContent = 'Delete';
      delBtn.style.marginLeft = '8px';
      delBtn.addEventListener('click', () => deleteApp(a.id));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      tr.appendChild(actions);
      tbody.appendChild(tr);
    });
  }

  function cell(text){ const td = document.createElement('td'); td.innerHTML = text; return td; }

  // begin editing a row: populate form and switch button to Update
  function startEdit(id){
    const a = apps.find(x => x.id === id);
    if(!a) return;
    document.getElementById('company').value = a.company;
    document.getElementById('role').value = a.role;
    document.getElementById('location').value = a.location;
    document.getElementById('applied_date').value = a.date;
    document.getElementById('status').value = a.status;
    document.getElementById('notes').value = a.notes;

    editingId = id;
    document.getElementById('addApplicationBtn').textContent = 'Update Application';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    // open Add Application panel so user sees the form
    openPanel('addPanel');
  }

  // delete with confirmation
  function deleteApp(id){
    if(!confirm('Delete this application?')) return;
    const idx = apps.findIndex(x => x.id === id);
    if(idx !== -1){
      apps.splice(idx,1);
      renderApps();
      if(editingId === id) cancelEdit();
    }
  }

  // reset form and edit state
  function cancelEdit(){
    editingId = null;
    document.getElementById('addApplicationBtn').textContent = 'Add Application';
    document.getElementById('cancelEditBtn').style.display = 'none';
    document.getElementById('addMsg').textContent = '';
    clearFormInputs();
  }

  function clearFormInputs(){
    document.getElementById('company').value = '';
    document.getElementById('role').value = '';
    document.getElementById('location').value = '';
    document.getElementById('applied_date').value = '';
    document.getElementById('status').value = 'Applied';
    document.getElementById('notes').value = '';
  }

  // Add / Update handler (same button)
  document.getElementById('addApplicationBtn').addEventListener('click', function() {
    const company = document.getElementById('company').value.trim();
    const role = document.getElementById('role').value.trim();
    const location = document.getElementById('location').value.trim();
    const date = document.getElementById('applied_date').value.trim();
    const status = document.getElementById('status').value;
    const notes = document.getElementById('notes').value.trim();

    if(!company || !role){
      document.getElementById('addMsg').textContent = 'Company and Role are required.';
      return;
    }

    if(editingId === null){
      // add new
      apps.unshift({
        id: nextId++,
        company, role, location, status, date, notes
      });
      document.getElementById('addMsg').textContent = 'Added ✓';
    } else {
      // update existing
      const idx = apps.findIndex(x => x.id === editingId);
      if(idx !== -1){
        apps[idx] = { id: editingId, company, role, location, status, date, notes };
        document.getElementById('addMsg').textContent = 'Updated ✓';
      }
      cancelEdit();
    }

    clearFormInputs();
    renderApps();
  });

  // Search and Refresh (very simple local)
  document.getElementById('searchBtn').addEventListener('click', function(){
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    const tbody = document.querySelector('#appsTable tbody');
    if(!q){ renderApps(); return; }
    tbody.innerHTML = '';
    apps.filter(a => (a.company + ' ' + a.role).toLowerCase().includes(q))
        .forEach(a => {
          const tr = document.createElement('tr');
          tr.appendChild(cell(escapeHtml(a.company)));
          tr.appendChild(cell(escapeHtml(a.role)));
          tr.appendChild(cell(escapeHtml(a.location)));
          tr.appendChild(cell(escapeHtml(a.status)));
          tr.appendChild(cell(escapeHtml(a.date)));
          tr.appendChild(cell(escapeHtml(a.notes)));
          const actions = document.createElement('td');
          const editBtn = document.createElement('button');
          editBtn.className = 'btn-sm btn-warning';
          editBtn.textContent = 'Edit';
          editBtn.addEventListener('click', () => startEdit(a.id));
          const delBtn = document.createElement('button');
          delBtn.className = 'btn-sm btn-danger';
          delBtn.style.marginLeft = '8px';
          delBtn.textContent = 'Delete';
          delBtn.addEventListener('click', () => deleteApp(a.id));
          actions.appendChild(editBtn); actions.appendChild(delBtn);
          tr.appendChild(actions);
          tbody.appendChild(tr);
        });
  });

  document.getElementById('refreshBtn').addEventListener('click', function(){ renderApps(); document.getElementById('searchInput').value=''; });

  // wire landing/app navigation
  loginBtn.addEventListener('click', showApp);
  exitBtn.addEventListener('click', function(){ cancelEdit(); showLanding(); });

  actionCards.forEach(c => {
    c.addEventListener('click', function(){
      const panelId = c.getAttribute('data-panel');
      openPanel(panelId);
    });
  });

  // initial state
  showLanding();
});
