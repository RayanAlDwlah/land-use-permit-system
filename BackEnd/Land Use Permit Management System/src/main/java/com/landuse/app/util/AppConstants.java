package com.landuse.app.util;

import java.util.Set;

public final class AppConstants {
    private AppConstants() {}
    public static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf", "image/jpeg", "image/jpg", "image/png"
    );
    public static final int MAX_FILENAME_LEN = 140;
}