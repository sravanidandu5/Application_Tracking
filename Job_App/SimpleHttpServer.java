// SimpleHttpServer.java
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.file.*;
import java.sql.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class SimpleHttpServer {
    private static final int PORT = 8080;
    private static final String WEBROOT = "web";
    
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        System.out.println("Server started at http://localhost:" + PORT);

        // static file handler
        server.createContext("/", exchange -> {
            try {
                URI uri = exchange.getRequestURI();
                String path = uri.getPath();
                if (path.equals("/")) path = "/index.html";
                Path file = Paths.get(WEBROOT + path).normalize();
                if (!file.startsWith(Paths.get(WEBROOT)) || !Files.exists(file) || Files.isDirectory(file)) {
                    send404(exchange); return;
                }
                byte[] bytes = Files.readAllBytes(file);
                exchange.getResponseHeaders().set("Content-Type", guessMime(file.toString()));
                exchange.sendResponseHeaders(200, bytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(bytes);
                os.close();
            } catch (Exception e) {
                e.printStackTrace();
                send500(exchange);
            }
        });

        // api handler
        server.createContext("/api/apps", exchange -> {
            try {
                String method = exchange.getRequestMethod();
                if ("GET".equalsIgnoreCase(method)) {
                    handleListApps(exchange);
                } else if ("POST".equalsIgnoreCase(method)) {
                    handleCreateApp(exchange);
                } else if ("PUT".equalsIgnoreCase(method)) {
                    handleUpdateApp(exchange);
                } else if ("DELETE".equalsIgnoreCase(method)) {
                    handleDeleteApp(exchange);
                } else {
                    send405(exchange);
                }
            } catch (Exception e) {
                e.printStackTrace();
                send500(exchange);
            }
        });

        server.setExecutor(null);
        server.start();
    }

    // ---------- Handlers ----------
    private static void handleListApps(HttpExchange ex) throws IOException {
        List<Map<String,Object>> apps = new ArrayList<>();
        try (Connection c = DBHelper.getConn();
             PreparedStatement ps = c.prepareStatement("SELECT id, company, role_title, location, status, applied_date, notes FROM applications ORDER BY created_at DESC");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String,Object> m = new LinkedHashMap<>();
                m.put("id", rs.getInt("id"));
                m.put("company", rs.getString("company"));
                m.put("role_title", rs.getString("role_title"));
                m.put("location", rs.getString("location"));
                m.put("status", rs.getString("status"));
                java.sql.Date ad = rs.getDate("applied_date");

                m.put("applied_date", ad == null ? "" : ad.toString());
                m.put("notes", rs.getString("notes"));
                apps.add(m);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        sendJson(ex, 200, toJsonArray(apps));
    }

    private static void handleCreateApp(HttpExchange ex) throws IOException {
        String body = new BufferedReader(new InputStreamReader(ex.getRequestBody())).lines().collect(Collectors.joining("\n"));
        Map<String,String> p = parseForm(body);
        String company = p.getOrDefault("company", "");
        String role = p.getOrDefault("role_title", "");
        String location = p.getOrDefault("location", "");
        String status = p.getOrDefault("status", "Applied");
        String appliedDate = p.getOrDefault("applied_date", "");
        String notes = p.getOrDefault("notes", "");

        // NOTE: SQL will set created_at via CURRENT_TIMESTAMP
        String insertSql = "INSERT INTO applications (company, role_title, location, status, applied_date, notes, created_at) "
                         + "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";

        try (Connection c = DBHelper.getConn();
             PreparedStatement ps = c.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, company);
            ps.setString(2, role);
            ps.setString(3, location);
            ps.setString(4, status);
            if (appliedDate == null || appliedDate.trim().isEmpty()) {
                ps.setNull(5, java.sql.Types.DATE);
            } else {
                // validate format (YYYY-MM-DD) and convert
                try {
                    LocalDate.parse(appliedDate);
                    ps.setDate(5, java.sql.Date.valueOf(appliedDate));
                } catch (Exception exDate) {
                    // invalid date format -> treat as NULL to avoid SQL error
                    ps.setNull(5, java.sql.Types.DATE);
                }
            }
            ps.setString(6, notes);

            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    int id = rs.getInt(1);
                    sendJson(ex, 200, "{\"success\":true, \"id\":" + id + "}");
                    return;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        sendJson(ex, 500, "{\"success\":false}");
    }

    private static void handleUpdateApp(HttpExchange ex) throws IOException {
        String body = new BufferedReader(new InputStreamReader(ex.getRequestBody())).lines().collect(Collectors.joining("\n"));
        Map<String,String> p = parseForm(body);
        int id = Integer.parseInt(p.getOrDefault("id", "0"));
        String company = p.getOrDefault("company", "");
        String role = p.getOrDefault("role_title", "");
        String location = p.getOrDefault("location", "");
        String status = p.getOrDefault("status", "Applied");
        String appliedDate = p.getOrDefault("applied_date", "");
        String notes = p.getOrDefault("notes", "");

        try (Connection c = DBHelper.getConn();
             PreparedStatement ps = c.prepareStatement("UPDATE applications SET company=?, role_title=?, location=?, status=?, applied_date=?, notes=? WHERE id=?")) {
            ps.setString(1, company);
            ps.setString(2, role);
            ps.setString(3, location);
            ps.setString(4, status);
            if (appliedDate == null || appliedDate.trim().isEmpty()) {
                ps.setNull(5, java.sql.Types.DATE);
            } else {
                try {
                    LocalDate.parse(appliedDate);
                    ps.setDate(5, java.sql.Date.valueOf(appliedDate));
                } catch (Exception exDate) {
                    ps.setNull(5, java.sql.Types.DATE);
                }
            }
            ps.setString(6, notes);
            ps.setInt(7, id);
            int rows = ps.executeUpdate();
            if (rows > 0) {
                sendJson(ex, 200, "{\"success\":true}");
                return;
            }
        } catch (Exception e) { e.printStackTrace(); }
        sendJson(ex, 500, "{\"success\":false}");
    }

    private static void handleDeleteApp(HttpExchange ex) throws IOException {
        String q = ex.getRequestURI().getQuery();
        int id = 0;
        if (q != null && q.contains("id=")) {
            try { id = Integer.parseInt(q.split("id=")[1].split("&")[0]); } catch(Exception e) {}
        }
        if (id == 0) { sendJson(ex, 400, "{\"success\":false, \"error\":\"missing id\"}"); return; }
        try (Connection c = DBHelper.getConn();
             PreparedStatement ps = c.prepareStatement("DELETE FROM applications WHERE id=?")) {
            ps.setInt(1, id);
            int rows = ps.executeUpdate();
            if (rows > 0) sendJson(ex, 200, "{\"success\":true}");
            else sendJson(ex, 404, "{\"success\":false, \"error\":\"not found\"}");
        } catch (Exception e) { e.printStackTrace(); sendJson(ex, 500, "{\"success\":false}"); }
    }

    // ---------- Utilities ----------
    private static void send404(HttpExchange ex) throws IOException {
        String r = "404 Not Found";
        ex.sendResponseHeaders(404, r.length());
        ex.getResponseBody().write(r.getBytes());
        ex.getResponseBody().close();
    }
    private static void send405(HttpExchange ex) throws IOException {
        String r = "405 Method Not Allowed";
        ex.sendResponseHeaders(405, r.length());
        ex.getResponseBody().write(r.getBytes());
        ex.getResponseBody().close();
    }
    private static void send500(HttpExchange ex) throws IOException {
        String r = "500 Internal Server Error";
        ex.sendResponseHeaders(500, r.length());
        ex.getResponseBody().write(r.getBytes());
        ex.getResponseBody().close();
    }
    private static void sendJson(HttpExchange ex, int code, String json) throws IOException {
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        byte[] b = json.getBytes("UTF-8");
        ex.sendResponseHeaders(code, b.length);
        ex.getResponseBody().write(b);
        ex.getResponseBody().close();
    }
    private static String guessMime(String f) {
        if (f.endsWith(".html")) return "text/html; charset=utf-8";
        if (f.endsWith(".css")) return "text/css; charset=utf-8";
        if (f.endsWith(".js")) return "application/javascript; charset=utf-8";
        return "text/plain; charset=utf-8";
    }
    private static Map<String,String> parseForm(String body) {
        Map<String,String> m = new HashMap<>();
        try {
            for (String pair : body.split("&")) {
                if (pair.isEmpty()) continue;
                String[] kv = pair.split("=",2);
                String k = URLDecoder.decode(kv[0],"UTF-8");
                String v = kv.length>1 ? URLDecoder.decode(kv[1],"UTF-8") : "";
                m.put(k, v);
            }
        } catch (Exception e) { e.printStackTrace(); }
        return m;
    }
    private static String toJsonArray(List<?> list) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        boolean first=true;
        for (Object o : list) {
            if (!first) sb.append(",");
            first=false;
            if (o instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String,Object> map = (Map<String,Object>) o;
                sb.append("{");
                boolean f2=true;
                for (Map.Entry<String,Object> e : map.entrySet()) {
                    if (!f2) sb.append(",");
                    f2=false;
                    sb.append("\"").append(escape(e.getKey())).append("\":");
                    Object val = e.getValue();
                    if (val instanceof Number) sb.append(val.toString());
                    else sb.append("\"").append(escape(String.valueOf(val))).append("\"");
                }
                sb.append("}");
            } else {
                sb.append("\"").append(escape(String.valueOf(o))).append("\"");
            }
        }
        sb.append("]");
        return sb.toString();
    }
    private static String escape(String s) {
        return s.replace("\\","\\\\").replace("\"","\\\"");
    }
}
