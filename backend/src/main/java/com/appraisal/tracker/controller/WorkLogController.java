package com.appraisal.tracker.controller;

import com.appraisal.tracker.model.Category;
import com.appraisal.tracker.model.WorkLog;
import com.appraisal.tracker.service.WorkLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*") // Allow frontend to connect from any local host port (e.g. 5173)
public class WorkLogController {

    @Autowired
    private WorkLogService service;

    @PostMapping
    public ResponseEntity<WorkLog> createLog(@RequestBody WorkLog log) {
        WorkLog saved = service.createLog(log);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<WorkLog>> getLogs(
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<WorkLog> logs = service.getLogs(category, startDate, endDate);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkLog> getLogById(@PathVariable Long id) {
        try {
            WorkLog log = service.getLogById(id);
            return ResponseEntity.ok(log);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkLog> updateLog(@PathVariable Long id, @RequestBody WorkLog logDetails) {
        try {
            WorkLog updated = service.updateLog(id, logDetails);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        try {
            service.deleteLog(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, String>> getSummary(
            @RequestHeader(value = "X-Copilot-API-Key", required = false) String customApiKey,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "false") boolean useLlm) {
        String summary = service.getSummary(customApiKey, category, startDate, endDate, useLlm);
        return ResponseEntity.ok(Map.of("summary", summary));
    }
}
