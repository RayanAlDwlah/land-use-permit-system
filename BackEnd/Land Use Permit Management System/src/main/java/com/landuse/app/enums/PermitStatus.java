package com.landuse.app.enums;

/**
 * Workflow states for a permit request.
 */
public enum PermitStatus {
    PENDING,         // Submitted by user, awaiting admin action
    APPROVED,        // Approved by admin
    REJECTED,        // Rejected by admin (requires a comment)
    EDIT_REQUESTED   // Admin requested edits; user can update then returns to PENDING
}