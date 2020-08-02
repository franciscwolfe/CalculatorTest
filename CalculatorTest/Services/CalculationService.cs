using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculatorTest.Services
{
    public class CalculationService
    {
        private int _maxLength;

        public CalculationService(int maxLength)
        {
            _maxLength = maxLength;
        }

        Dictionary<string, Func<decimal, decimal?, decimal>> Operations = new Dictionary<string, Func<decimal, decimal?, decimal>>
        {
            { "⁺∕₋", (a,b) => { if (b != null) { throw new ArgumentException(); } else return -a; } },
            { "√", (a,b) => { if (b != null) { throw new ArgumentException(); } else return (decimal) Math.Sqrt((double) a); } },
            { "÷", (a,b) => a / (decimal) b },
            { "×", (a,b) => a * (decimal) b },
            { "-", (a,b) => a - (decimal) b },
            { "+", (a,b) => a + (decimal) b },
        };

        public string Calculate(string leftOperand, string rightOperand, string operation)
        {
            var left = decimal.Parse(leftOperand);

            decimal tmpvalue;
            decimal? right = decimal.TryParse((string)rightOperand, out tmpvalue) ?
              tmpvalue : (decimal?)null;

            var resultValue = this.Operations[operation](left, right);

            string result;
            if (decimal.Round(resultValue).ToString().Length > _maxLength)
            {
                result = "OVERFLOW";
            }
            else
            {
                var resultAsString = resultValue.ToString();
                result = resultAsString.Substring(0, Math.Min(resultAsString.Length, _maxLength + (resultAsString.Contains('.') ? 1 : 0)));
                if (result.EndsWith(".")) { result = result.Substring(0, _maxLength); }
            }
            return result;

        }
    }
}
