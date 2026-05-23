package com.appraisal.tracker.service;

import com.appraisal.tracker.model.Category;
import com.appraisal.tracker.model.WorkLog;
import com.appraisal.tracker.repository.WorkLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class WorkLogService {

    @Autowired
    private WorkLogRepository repository;

    @Autowired
    private SummarizerEngine summarizerEngine;

    public WorkLog createLog(WorkLog log) {
        return repository.save(log);
    }

    public List<WorkLog> getLogs(Category category, LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            if (category != null) {
                return repository.findByCategoryAndDateBetweenOrderByDateDesc(category, startDate, endDate);
            } else {
                return repository.findByDateBetweenOrderByDateDesc(startDate, endDate);
            }
        } else {
            if (category != null) {
                return repository.findByCategoryOrderByDateDesc(category);
            } else {
                return repository.findAll(Sort.by(Sort.Direction.DESC, "date"));
            }
        }
    }

    public WorkLog getLogById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Log not found with ID: " + id));
    }

    public WorkLog updateLog(Long id, WorkLog updatedDetails) {
        WorkLog existing = getLogById(id);
        existing.setContent(updatedDetails.getContent());
        existing.setCategory(updatedDetails.getCategory());
        existing.setDate(updatedDetails.getDate());
        existing.setSprint(updatedDetails.getSprint());
        existing.setImpact(updatedDetails.getImpact());
        return repository.save(existing);
    }

    public void deleteLog(Long id) {
        WorkLog existing = getLogById(id);
        repository.delete(existing);
    }

    public String getSummary(String customApiKey, Category category, LocalDate startDate, LocalDate endDate, boolean useLlm) {
        // Fetch logs over the date range, ignoring category filter for overall summary unless specified
        List<WorkLog> logs = getLogs(category, startDate, endDate);
        return summarizerEngine.generateSummary(customApiKey, logs, startDate, endDate, useLlm);
    }
}
