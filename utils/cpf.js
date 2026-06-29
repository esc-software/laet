function validate(cpf) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const calc = (slice, factor) => {
    let sum = 0;
    for (const d of slice) sum += parseInt(d) * factor--;
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const dig1 = calc(digits.slice(0, 9), 10);
  if (dig1 !== parseInt(digits[9])) return false;
  const dig2 = calc(digits.slice(0, 10), 11);
  return dig2 === parseInt(digits[10]);
}

module.exports = { validate };
