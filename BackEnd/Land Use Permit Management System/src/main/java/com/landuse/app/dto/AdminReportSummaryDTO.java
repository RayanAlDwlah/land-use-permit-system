package com.landuse.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminReportSummaryDTO {
    private long totalPermits;
    private long pendingCount;
    private long approvedCount;
    private long rejectedCount;
    private long editRequestedCount;
}