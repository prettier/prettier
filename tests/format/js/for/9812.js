for (const p of ['fullName', 'organ', 'position', 'rank'])
  // comment
  form.setValue(`${prefix}.data.${p}`, response[p])
