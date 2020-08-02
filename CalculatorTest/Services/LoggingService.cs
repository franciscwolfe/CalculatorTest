using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculatorTest.Services
{
    public class LoggingService
    {
        public void Log(string leftOperand, string rightOperand, string operation, string ipAddress)
        {
            string cs = "Data Source=Database\\log.db";

            using var con = new SqliteConnection(cs);
            using SqliteCommand com = con.CreateCommand();
            con.Open();

            const string query = "INSERT INTO LogEntries(LeftOperand, RightOperand, Operation, IpAddress, Timestamp) " +
                "VALUES(@leftOperand, @rightOperand, @operation, @ipAddress, @timestamp)";

            var args = new Dictionary<string, object>
            {
                {"@leftOperand", leftOperand},
                {"@rightOperand", rightOperand ?? (object) DBNull.Value},
                {"@operation", operation},
                {"@ipAddress", ipAddress},
                {"@timestamp", DateTime.UtcNow.ToString("o") }
            };

            using (var cmd = new SqliteCommand(query, con))
            {
                foreach (var pair in args)
                {
                    cmd.Parameters.AddWithValue(pair.Key, pair.Value);
                }
                
                cmd.ExecuteNonQuery();
            }
        }
    }
}
