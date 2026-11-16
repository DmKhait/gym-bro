function getDashboard() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('Missing SPREADSHEET_ID script property.');

  const { valueRanges } = Sheets.Spreadsheets.Values.batchGet(spreadsheetId, {
    ranges: ["'Дашборд'!B2", "'Дашборд'!B7:C11", "'Дашборд'!A16:F23", "'Трекер'!B5:G"],
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'SERIAL_NUMBER',
  });

  return parseDashboard_(valueRanges.map(({ values }) => values || []));
}

function parseDashboard_(ranges) {
  const [header, today, week, tracker] = ranges;
  const date = isoDate_(header[0]?.[0]);
  const days = week.slice(0, 7).map(([serial, ...values]) => ({
    date: isoDate_(serial),
    ...totals_(values),
  }));
  if (days.length !== 7 || !days.some(day => day.date === date)) {
    throw new Error('The weekly range on Дашборд is incomplete.');
  }

  const weights = [];
  for (const row of tracker) {
    const kg = numberOrNull_(row[5]);
    if (kg !== null && kg > 0) weights.push({ date: isoDate_(row[0]), kg });
  }
  weights.sort((a, b) => a.date.localeCompare(b.date));

  return {
    date,
    actual: totals_(today.map(row => row[0])),
    goal: totals_(today.map(row => row[1])),
    days,
    averages: totals_((week[7] || []).slice(1)),
    weights,
  };
}

function totals_(values) {
  const [calories, protein, fat, carbs, water] = values.map(numberOrNull_);
  return {
    calories: calories ?? null,
    protein: protein ?? null,
    fat: fat ?? null,
    carbs: carbs ?? null,
    water: water ?? null,
  };
}

function numberOrNull_(value) {
  if (value === undefined || value === '') return null;
  if (!Number.isFinite(value)) throw new Error('The dashboard contains a non-numeric metric.');
  return value;
}

function isoDate_(serial) {
  if (!Number.isFinite(serial)) throw new Error('The dashboard contains an invalid date.');
  const sheetsEpoch = Date.UTC(1899, 11, 30);
  return new Date(sheetsEpoch + Math.floor(serial) * 86400000).toISOString().slice(0, 10);
}
