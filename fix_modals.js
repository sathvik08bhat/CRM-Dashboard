const fs = require('fs');
let content = fs.readFileSync('public/dashboard.js', 'utf8');

// The replacements we know
const confirmReplacements = [
    { old: "if (!confirm('Regenerate API key? This will invalidate the current key.')) return;", new: "if (!(await swalConfirm('Regenerate API key? This will invalidate the current key.'))) return;" },
    { old: "const name = prompt('Enter stage name:');", new: "const name = await swalPrompt('Enter stage name:');" },
    { old: "const newName = prompt('Enter new name:', stage.name);", new: "const newName = await swalPrompt('Enter new name:', stage.name);" },
    { old: "if (confirm('Delete this stage? Leads will be moved to the first stage.')) {", new: "if (await swalConfirm('Delete this stage? Leads will be moved to the first stage.')) {" },
    { old: "if (!confirm('Are you sure you want to delete this file?')) return;", new: "if (!(await swalConfirm('Are you sure you want to delete this file?'))) return;" },
    { old: "const content = prompt('Enter your note:');", new: "const content = await swalPrompt('Enter your note:');" },
    { old: "const newContent = prompt('Edit your note:', currentContent);", new: "const newContent = await swalPrompt('Edit your note:', currentContent);" },
    { old: "if (!confirm('Are you sure you want to delete this note?')) return;", new: "if (!(await swalConfirm('Are you sure you want to delete this note?'))) return;" },
    { old: "if (!confirm(`Are you sure you want to ${action} this user?`)) {", new: "if (!(await swalConfirm(`Are you sure you want to ${action} this user?`))) {" },
    { old: "const newPassword = prompt('Enter new password for user (minimum 6 characters):');", new: "const newPassword = await swalPrompt('Enter new password for user (minimum 6 characters):');" },
    { old: "if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {", new: "if (!(await swalConfirm('Are you sure you want to delete this user? This action cannot be undone.'))) {" },
    { old: "if (!confirm('Delete lead?')) return;", new: "if (!(await swalConfirm('Delete lead?'))) return;" },
    { old: "if (!confirm('Mark this task as completed?')) return;", new: "if (!(await swalConfirm('Mark this task as completed?'))) return;" },
    { old: "if (!confirm('Are you sure you want to delete this task?')) return;", new: "if (!(await swalConfirm('Are you sure you want to delete this task?'))) return;" },
    { old: "if (!confirm('Regenerate API key? This will invalidate your current key.')) return;", new: "if (!(await swalConfirm('Regenerate API key? This will invalidate your current key.'))) return;" },
    { old: "const fieldName = prompt('Enter custom field name:');", new: "const fieldName = await swalPrompt('Enter custom field name:');" },
    { old: "const fieldType = prompt('Enter field type (text/number/date/select):');", new: "const fieldType = await swalPrompt('Enter field type (text/number/date/select):');" },
    { old: "if (confirm('Delete this stage? Operations tickets in this stage will be moved to the first stage.')) {", new: "if (await swalConfirm('Delete this stage? Operations tickets in this stage will be moved to the first stage.')) {" },
    { old: "if (!confirm('Are you sure you want to delete this operation ticket?')) return;", new: "if (!(await swalConfirm('Are you sure you want to delete this operation ticket?'))) return;" },
    { old: "if (!confirm('Are you sure you want to remove your email configuration? You will not be able to send emails until you configure it again.')) {", new: "if (!(await swalConfirm('Are you sure you want to remove your email configuration? You will not be able to send emails until you configure it again.'))) {" },
    { old: "if (!confirm(`Reset counter to 0 for ${prefix}/${fy}? The next invoice will be ${prefix}/${fy}/001.\\n\\nThis does NOT delete any existing invoices.`)) return;", new: "if (!(await swalConfirm(`Reset counter to 0 for ${prefix}/${fy}? The next invoice will be ${prefix}/${fy}/001.\\n\\nThis does NOT delete any existing invoices.`))) return;" },
    { old: "if (!confirm('Delete this invoice? This cannot be undone.')) return;", new: "if (!(await swalConfirm('Delete this invoice? This cannot be undone.'))) return;" },
    { old: "if (!confirm('Approve this invoice?')) return;", new: "if (!(await swalConfirm('Approve this invoice?'))) return;" },
    { old: "if (!confirm('Delete this customer? Only possible if no invoices exist for them.')) return;", new: "if (!(await swalConfirm('Delete this customer? Only possible if no invoices exist for them.'))) return;" },
    { old: "if (!confirm('Delete this company? Only possible if no invoices were billed from it.')) return;", new: "if (!(await swalConfirm('Delete this company? Only possible if no invoices were billed from it.'))) return;" }
];

confirmReplacements.forEach(rep => {
    content = content.replace(rep.old, rep.new);
});

// Now we need to ensure their containing functions are async.
// By doing regex replacement on the function declarations.
const addAsyncTo = [
    'function addPipelineStage',
    'function editPipelineStage',
    'function deletePipelineStage',
    'function addOperationsStage',
    'function editOperationsStage',
    'function deleteOperationsStage',
    'function toggleUserStatus',
    'function resetUserPassword',
    'function deleteUser',
    'function deleteLead',
    'function completeTask',
    'function deleteTask',
    'function removeEmailConfig',
    'function toggleCustomField',
    'function generateApiKey',
    'function openAddNoteModal',
    'function editNote',
    'function downloadFile',
    'function deleteFile',
    'function addCustomField',
    'function resetInvoiceCounter',
    'function deleteInvoice',
    'function approveInvoice',
    'function deleteCustomer',
    'function deleteBillingCompany'
];

addAsyncTo.forEach(fn => {
    content = content.replace(new RegExp('^' + fn, 'gm'), 'async ' + fn);
});

fs.writeFileSync('public/dashboard.js', content, 'utf8');
