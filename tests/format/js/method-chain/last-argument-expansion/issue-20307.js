async function a(harness, firstPatch) {
  harness.deps.patchDraft.mockReturnValueOnce(firstPatch).mockResolvedValueOnce({ ok: true, status: 200, body: { revision: 20, changed: ['span_a'], plan_name: 'orm' } });
}
