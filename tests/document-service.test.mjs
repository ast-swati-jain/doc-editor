import test from 'node:test';
import assert from 'node:assert/strict';

// Test the core business logic, permissions, file converters, and storage operations
const BASE_URL = 'http://localhost:3000';

test('1. Document Creation & Retrieval', async (t) => {
  const payload = {
    title: 'Automated Test Document ' + Date.now(),
    content: '<h1>Test Heading</h1><p>Testing doc creation workflow.</p>',
    ownerEmail: 'swati2003jain@gmail.com',
    ownerName: 'Swati Jain'
  };

  const createRes = await fetch(`${BASE_URL}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(createRes.status, 201, 'Should create document with HTTP 201');
  const createData = await createRes.json();
  assert.ok(createData.doc?.id, 'Document must have a unique ID');
  assert.equal(createData.doc.title, payload.title);
  assert.equal(createData.doc.ownerEmail, payload.ownerEmail);

  // Retrieve document
  const getRes = await fetch(`${BASE_URL}/api/documents/${createData.doc.id}?userEmail=${payload.ownerEmail}`);
  assert.equal(getRes.status, 200, 'Should fetch document with HTTP 200');
  const getData = await getRes.json();
  assert.equal(getData.userRole, 'owner', 'Creator should be assigned owner role');

  // Cleanup
  await fetch(`${BASE_URL}/api/documents/${createData.doc.id}?userEmail=${payload.ownerEmail}`, { method: 'DELETE' });
});

test('2. Role-Based Sharing & Permissions Enforcement', async (t) => {
  // Create document as Swati
  const docRes = await fetch(`${BASE_URL}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Sharing Permissions Test Doc',
      content: '<p>Initial text</p>',
      ownerEmail: 'swati2003jain@gmail.com'
    })
  });
  const { doc } = await docRes.json();

  // Share with Alex as 'editor'
  const shareAlexRes = await fetch(`${BASE_URL}/api/documents/${doc.id}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetEmail: 'alex@ajaia.internal',
      role: 'editor',
      userEmail: 'swati2003jain@gmail.com'
    })
  });
  assert.equal(shareAlexRes.status, 200);
  const shareAlexData = await shareAlexRes.json();
  assert.ok(shareAlexData.doc.collaborators.some(c => c.email === 'alex@ajaia.internal' && c.role === 'editor'));

  // Alex (Editor) should be able to update content
  const alexEditRes = await fetch(`${BASE_URL}/api/documents/${doc.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: '<p>Content updated by Alex (Editor)</p>',
      userEmail: 'alex@ajaia.internal'
    })
  });
  assert.equal(alexEditRes.status, 200, 'Editor should be authorized to edit content');

  // Share with Taylor as 'viewer'
  const shareTaylorRes = await fetch(`${BASE_URL}/api/documents/${doc.id}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetEmail: 'taylor@ajaia.internal',
      role: 'viewer',
      userEmail: 'swati2003jain@gmail.com'
    })
  });
  assert.equal(shareTaylorRes.status, 200);

  // Taylor (Viewer) should BE REJECTED (HTTP 403) from editing
  const taylorEditRes = await fetch(`${BASE_URL}/api/documents/${doc.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: '<p>Unauthorized viewer edit attempt</p>',
      userEmail: 'taylor@ajaia.internal'
    })
  });
  assert.equal(taylorEditRes.status, 403, 'Viewer must be denied edit access with 403 Forbidden');

  // Alex (non-owner) should NOT be allowed to delete document
  const alexDeleteRes = await fetch(`${BASE_URL}/api/documents/${doc.id}?userEmail=alex@ajaia.internal`, {
    method: 'DELETE'
  });
  assert.equal(alexDeleteRes.status, 403, 'Non-owner must be prevented from deleting document');

  // Swati (Owner) CAN delete document
  const ownerDeleteRes = await fetch(`${BASE_URL}/api/documents/${doc.id}?userEmail=swati2003jain@gmail.com`, {
    method: 'DELETE'
  });
  assert.equal(ownerDeleteRes.status, 200, 'Owner can delete document');
});

test('3. File Upload & Import Workflow (.md and .txt)', async (t) => {
  const markdownText = `# Architecture Roadmap
**Prepared by Swati Jain**
- Component modularity
- Persistence resilience
- Granular permissions`;

  const importRes = await fetch(`${BASE_URL}/api/documents/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: 'architecture_roadmap.md',
      fileContent: markdownText,
      fileType: 'text/markdown',
      ownerEmail: 'swati2003jain@gmail.com'
    })
  });

  assert.equal(importRes.status, 201, 'File import should create document with HTTP 201');
  const importData = await importRes.json();
  assert.ok(importData.doc.title.includes('architecture_roadmap'));
  assert.ok(importData.doc.content.includes('<h1>'), 'Markdown # should convert to <h1> tag');
  assert.ok(importData.doc.content.includes('<strong>'), 'Markdown ** should convert to <strong> tag');
  assert.ok(importData.doc.content.includes('<li>'), 'Markdown - should convert to <li> list items');

  // Cleanup
  await fetch(`${BASE_URL}/api/documents/${importData.doc.id}?userEmail=swati2003jain@gmail.com`, { method: 'DELETE' });
});

test('4. File Attachments Workflow', async (t) => {
  // Create test doc
  const docRes = await fetch(`${BASE_URL}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Attachment Test Doc',
      content: '<p>Attachment testing</p>',
      ownerEmail: 'swati2003jain@gmail.com'
    })
  });
  const { doc } = await docRes.json();

  // Attach a file
  const attachRes = await fetch(`${BASE_URL}/api/documents/${doc.id}/attachments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'diagram.png',
      size: 10420,
      type: 'image/png',
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      userEmail: 'swati2003jain@gmail.com'
    })
  });

  assert.equal(attachRes.status, 200, 'File attachment should succeed with HTTP 200');
  const attachData = await attachRes.json();
  assert.equal(attachData.doc.attachments.length, 1);
  assert.equal(attachData.doc.attachments[0].name, 'diagram.png');

  // Cleanup
  await fetch(`${BASE_URL}/api/documents/${doc.id}?userEmail=swati2003jain@gmail.com`, { method: 'DELETE' });
});

test('5. Version History & Restoration', async (t) => {
  // Create doc
  const docRes = await fetch(`${BASE_URL}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Version History Original Title',
      content: '<p>Original Version Content</p>',
      ownerEmail: 'swati2003jain@gmail.com'
    })
  });
  const { doc } = await docRes.json();
  const initialVersionId = doc.versions[0].id;

  // Make an update that records a new version snapshot
  await fetch(`${BASE_URL}/api/documents/${doc.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Updated Title',
      content: '<p>Modified Content</p>',
      userEmail: 'swati2003jain@gmail.com',
      recordVersion: true,
      versionSummary: 'Sprint review revision'
    })
  });

  // Restore the initial version
  const restoreRes = await fetch(`${BASE_URL}/api/documents/${doc.id}/versions/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      versionId: initialVersionId,
      userEmail: 'swati2003jain@gmail.com'
    })
  });

  assert.equal(restoreRes.status, 200, 'Version restoration should return HTTP 200');
  const restoreData = await restoreRes.json();
  assert.equal(restoreData.doc.title, 'Version History Original Title', 'Title should be restored to initial snapshot');
  assert.equal(restoreData.doc.content, '<p>Original Version Content</p>', 'Content should be restored to initial snapshot');

  // Cleanup
  await fetch(`${BASE_URL}/api/documents/${doc.id}?userEmail=swati2003jain@gmail.com`, { method: 'DELETE' });
});
