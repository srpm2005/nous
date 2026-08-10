package com.project.nous.service.adapter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawJobPosting {
    private String externalId;
    private String title;
    private String location;
    private String department;
    private String applyUrl;
    private String salaryRange;
}
