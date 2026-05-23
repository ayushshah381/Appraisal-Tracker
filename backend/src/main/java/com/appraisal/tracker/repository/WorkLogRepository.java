package com.appraisal.tracker.repository;

import com.appraisal.tracker.model.Category;
import com.appraisal.tracker.model.WorkLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {
    
    List<WorkLog> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
    
    List<WorkLog> findByCategoryOrderByDateDesc(Category category);
    
    List<WorkLog> findByCategoryAndDateBetweenOrderByDateDesc(Category category, LocalDate startDate, LocalDate endDate);
    
    List<WorkLog> findBySprintOrderByDateDesc(String sprint);
    
    List<WorkLog> findBySprintAndCategoryOrderByDateDesc(String sprint, Category category);
}
