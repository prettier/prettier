async function f() {
  if (untrackedChoice === 0) /* Cancel */ {
    return null;
  } else if (untrackedChoice === 1) /* Add */ {
    await repository.addAll(Array.from(untrackedChanges.keys()));
    shouldAmend = true;
  } else if (untrackedChoice === 2) /* Allow Untracked */ {
    allowUntracked = true;
  }
}

async function f() {
  if (untrackedChoice === 0) /* Cancel */
    null;
  else if (untrackedChoice === 1) /* Add */
    shouldAmend = true;
  else if (untrackedChoice === 2) /* Allow Untracked */
    allowUntracked = true;
}

async function f() {
  if (untrackedChoice === 0) /* Cancel */ // Cancel
    null;
  else if (untrackedChoice === 1) /* Add */ // Add
    shouldAmend = true;
  else if (untrackedChoice === 2) /* Allow Untracked */ // Allow Untracked
    allowUntracked = true;
}

async function f() {
  if (untrackedChoice === 0)
    /* Cancel */ {
      return null;
    }
  else if (untrackedChoice === 1)
    /* Add */ {
      await repository.addAll(Array.from(untrackedChanges.keys()));
      shouldAmend = true;
    }
  else if (untrackedChoice === 2)
    /* Allow Untracked */ {
      allowUntracked = true;
    }
}

async function f() {
  if (untrackedChoice === 0) {
    /* Cancel */ return null;
  } else if (untrackedChoice === 1) {
    /* Add */ await repository.addAll(Array.from(untrackedChanges.keys()));
    shouldAmend = true;
  } else if (untrackedChoice === 2) {
    /* Allow Untracked */ allowUntracked = true;
  }
}
