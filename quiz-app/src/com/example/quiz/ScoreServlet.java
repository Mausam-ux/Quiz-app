package com.example.quiz;

import jakarta.servlet.http.*;
import jakarta.servlet.*;
import java.io.*;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ScoreServlet extends HttpServlet {

    // ✅ Database credentials
    private static final String DB_URL = "jdbc:mysql://localhost:3306/quizdb"; // your database
    private static final String DB_USER = "root"; // your MySQL username
    private static final String DB_PASS = "Satyam@9024"; // <-- change this

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        res.setContentType("text/plain");
        PrintWriter out = res.getWriter();

        String email = req.getParameter("email");
        String name = req.getParameter("name");
        String scoreStr = req.getParameter("score");
        String totalStr = req.getParameter("total");

        try {
            int score = Integer.parseInt(scoreStr);
            int total = Integer.parseInt(totalStr);

            // ✅ Current date and time
            String date = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            // ✅ Load MySQL driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // ✅ Connect to database
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
                String sql = "INSERT INTO scores (email, name, score, total, date) VALUES (?, ?, ?, ?, ?)";
                PreparedStatement ps = conn.prepareStatement(sql);
                ps.setString(1, email);
                ps.setString(2, name);
                ps.setInt(3, score);
                ps.setInt(4, total);
                ps.setString(5, date);

                ps.executeUpdate();
                ps.close();

                out.write("✅ Score saved successfully for " + name);
            }

        } catch (NumberFormatException e) {
            out.write("❌ Invalid score or total value");
        } catch (Exception e) {
            e.printStackTrace(out);
            out.write("❌ Error saving score: " + e.getMessage());
        }
    }
}
