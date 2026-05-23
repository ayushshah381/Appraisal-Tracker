package com.appraisal.tracker.service;

import com.appraisal.tracker.model.Category;
import com.appraisal.tracker.model.WorkLog;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class SummarizerEngine {

    @Value("${copilot.api.key:}")
    private String apiKey;

    @Value("${copilot.api.url}")
    private String apiUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateSummary(String customApiKey, List<WorkLog> logs, LocalDate startDate, LocalDate endDate, boolean useLlm) {
        if (logs == null || logs.isEmpty()) {
            return "### Performance & Appraisal Summary\nNo logs found for the selected period.";
        }

        String localSummary = generateLocalSummary(logs, startDate, endDate);

        if (!useLlm) {
            return localSummary;
        }

        String activeKey = (customApiKey != null && !customApiKey.trim().isEmpty()) ? customApiKey : apiKey;

        if (activeKey == null || activeKey.trim().isEmpty()) {
            return localSummary + "\n\n---\n*💡 Note: Configure your AI API key in the sidebar to enable AI-powered performance narratives.*";
        }

        try {
            return generateLlmSummary(logs, localSummary, activeKey);
        } catch (Exception e) {
            System.err.println("AI summarization failed: " + e.getMessage());
            e.printStackTrace();
            return localSummary + "\n\n---\n*⚠️ AI Summarization failed: " + e.getMessage() + ". Showing template-based summary above.*";
        }
    }

    private String generateLocalSummary(List<WorkLog> logs, LocalDate startDate, LocalDate endDate) {
        StringBuilder sb = new StringBuilder();
        DateTimeFormatter df = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        
        sb.append("# 📈 Performance & Appraisal Summary\n");
        sb.append("**Period:** ").append(startDate != null ? startDate.format(df) : "All Time")
          .append(" to ").append(endDate != null ? endDate.format(df) : "Present").append("\n");
        sb.append("**Generated on:** ").append(LocalDate.now().format(df)).append("\n\n");

        // Group by category
        Map<Category, List<WorkLog>> grouped = logs.stream()
                .collect(Collectors.groupingBy(WorkLog::getCategory));

        // Awards first
        if (grouped.containsKey(Category.AWARD)) {
            sb.append("## 🏆 Awards & Recognition\n");
            for (WorkLog log : grouped.get(Category.AWARD)) {
                sb.append("- **[").append(log.getDate().format(df)).append("]** ")
                  .append(log.getContent());
                if (log.getImpact() != null && !log.getImpact().trim().isEmpty()) {
                    sb.append(" *(Impact: ").append(log.getImpact()).append(")*");
                }
                sb.append("\n");
            }
            sb.append("\n");
        }

        // Appreciations next
        if (grouped.containsKey(Category.APPRECIATION)) {
            sb.append("## 💬 Peer & Leadership Appreciation\n");
            for (WorkLog log : grouped.get(Category.APPRECIATION)) {
                sb.append("- **[").append(log.getDate().format(df)).append("]** ")
                  .append(log.getContent());
                if (log.getImpact() != null && !log.getImpact().trim().isEmpty()) {
                    sb.append(" *(Impact: ").append(log.getImpact()).append(")*");
                }
                sb.append("\n");
            }
            sb.append("\n");
        }

        // Work/Deliverables
        if (grouped.containsKey(Category.WORK)) {
            sb.append("## 💻 Key Deliverables & Contributions\n");
            for (WorkLog log : grouped.get(Category.WORK)) {
                sb.append("- **[").append(log.getDate().format(df)).append("]** ")
                  .append(log.getContent());
                if (log.getSprint() != null && !log.getSprint().trim().isEmpty()) {
                    sb.append(" *(Sprint: ").append(log.getSprint()).append(")*");
                }
                if (log.getImpact() != null && !log.getImpact().trim().isEmpty()) {
                    sb.append(" *(Impact: ").append(log.getImpact()).append(")*");
                }
                sb.append("\n");
            }
            sb.append("\n");
        }

        // Learning & Skills
        if (grouped.containsKey(Category.LEARNING)) {
            sb.append("## 📚 Skills & Professional Development\n");
            for (WorkLog log : grouped.get(Category.LEARNING)) {
                sb.append("- **[").append(log.getDate().format(df)).append("]** ")
                  .append(log.getContent());
                if (log.getImpact() != null && !log.getImpact().trim().isEmpty()) {
                    sb.append(" *(Details: ").append(log.getImpact()).append(")*");
                }
                sb.append("\n");
            }
            sb.append("\n");
        }

        return sb.toString();
    }

    private String generateLlmSummary(List<WorkLog> logs, String rawLogsSummary, String activeKey) throws Exception {
        String prompt = "You are a senior technical program manager and career coach preparing an annual/semi-annual self-appraisal summary for a Software Engineer.\n\n" +
                "Given the following chronological list of logged work items, appreciations, awards, and learning points, rewrite them into a professional, highly impactful self-appraisal document.\n\n" +
                "Requirements:\n" +
                "1. Highlight achievements using professional business terminology (e.g., instead of 'fixed a database bug', write 'optimized query performance and improved system reliability').\n" +
                "2. Focus on action and concrete business/technical outcomes. Show initiative and leadership where possible.\n" +
                "3. Organize the output into clear Markdown sections:\n" +
                "   - **I. Executive Summary** (A brief 3-4 sentence elevator pitch summarizing the overall impact over the period)\n" +
                "   - **II. Major Technical Achievements & Deliverables** (Grouped logically into bullet points, showcasing engineering strength and business impact)\n" +
                "   - **III. Collaboration, Feedback & Peer Appreciations** (Highlights of positive feedback, teamwork, mentoring, or leadership)\n" +
                "   - **IV. Continuous Learning & Capabilities** (Technologies mastered, certifications completed, or new initiatives driven)\n" +
                "4. Maintain an objective yet positive, high-performing professional tone.\n\n" +
                "Here is the log summary of what was accomplished:\n" +
                rawLogsSummary;

        // Build AI payload
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> partsWrapper = new HashMap<>();
        partsWrapper.put("parts", List.of(textPart));

        Map<String, Object> contentObj = new HashMap<>();
        contentObj.put("contents", List.of(partsWrapper));

        String jsonPayload = objectMapper.writeValueAsString(contentObj);

        // Make HTTP Request
        String requestUrl = apiUrl + "?key=" + activeKey;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(requestUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP error code " + response.statusCode() + " response: " + response.body());
        }

        // Parse Response
        JsonNode rootNode = objectMapper.readTree(response.body());
        JsonNode textNode = rootNode
                .path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text");

        if (textNode.isMissingNode() || textNode.asText().isEmpty()) {
            throw new RuntimeException("Failed to parse response text from AI service. Full response: " + response.body());
        }

        return textNode.asText();
    }
}
