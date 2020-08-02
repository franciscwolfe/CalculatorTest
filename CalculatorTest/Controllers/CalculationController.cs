using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CalculatorTest.Services;
using Microsoft.AspNetCore.Mvc;

namespace CalculatorTest.Controllers
{
    [Route("api/calculation")]
    [ApiController]
    public class CalculationController : ControllerBase
    {
        const int maxLength = 15;
        private CalculationService _calculationService;
        private LoggingService _loggingService;

        public CalculationController()
        {
            _calculationService = new CalculationService(maxLength);
            _loggingService = new LoggingService();
        }

        // GET api/calculation
        [HttpGet()]
        public string Get(string leftOperand, string rightOperand, string operation)
        {
            var ipAddress = Request.HttpContext.Connection.RemoteIpAddress.ToString();
            _loggingService.Log(leftOperand, rightOperand, operation, ipAddress);

            try
            {
                var result = _calculationService.Calculate(leftOperand, rightOperand, operation);
                return result;
            }
            catch (Exception)
            {
                return "ERROR";
            }
        }
    }
}
