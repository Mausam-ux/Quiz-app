package com.example.quiz;

import jakarta.servlet.http.*;
import jakarta.servlet.*;
import java.io.*;
import java.sql.*;
import java.util.*;
import com.google.gson.Gson;

public class QuizServlet extends HttpServlet {

    private static final String DB_URL = "jdbc:mysql://localhost:3306/quizdb";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "Satyam@9024";

    static class Question {
        String question;
        String[] options;
        String answer;

        Question(String q, String[] opts, String ans) {
            question = q;
            options = opts;
            answer = ans;
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        res.setContentType("application/json");

        List<Question> quizList = new ArrayList<>();

        try {
            // Load MySQL driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Connect to DB
            Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);

            String sql = "SELECT question, option1, option2, option3, option4, answer FROM questions";
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                String q = rs.getString("question");
                String[] opts = {
                    rs.getString("option1"),
                    rs.getString("option2"),
                    rs.getString("option3"),
                    rs.getString("option4")
                };
                String ans = rs.getString("answer");

                quizList.add(new Question(q, opts, ans));
            }

            rs.close();
            ps.close();
            conn.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        // Convert list to JSON
        String json = new Gson().toJson(quizList);
        res.getWriter().write(json);
    }
}
