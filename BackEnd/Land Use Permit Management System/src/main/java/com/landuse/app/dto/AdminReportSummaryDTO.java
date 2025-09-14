package com.landuse.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AdminReportSummaryDTO(
        @JsonProperty("TOTAL") long TOTAL,
        @JsonProperty("PENDING") long PENDING,
        @JsonProperty("APPROVED") long APPROVED,
        @JsonProperty("REJECTED") long REJECTED,
        @JsonProperty("EDIT_REQUESTED") long EDIT_REQUESTED
) {}