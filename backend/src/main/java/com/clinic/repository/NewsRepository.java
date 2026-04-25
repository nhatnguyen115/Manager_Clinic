package com.clinic.repository;

import com.clinic.entity.News;
import com.clinic.entity.enums.NewsCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsRepository extends JpaRepository<News, UUID> {

    Page<News> findByIsPublishedTrueOrderByPublishedAtDesc(Pageable pageable);

    Page<News> findByCategoryAndIsPublishedTrue(NewsCategory category, Pageable pageable);

    List<News> findByIsFeaturedTrueAndIsPublishedTrue();

    Optional<News> findBySlug(String slug);
}
