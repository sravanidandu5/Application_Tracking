import java.sql.*;

public class DBHelper {

    private static final String URL = 
        "jdbc:mysql://localhost:3306/job_tracker?allowPublicKeyRetrieval=true&useSSL=false";

    private static final String USER = "root";
    private static final String PASS = "Sravani@123";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static Connection getConn() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }

    public static void closeQuietly(AutoCloseable ac) {
        if (ac == null) return;
        try { ac.close(); } catch (Exception e) { }
    }
}
