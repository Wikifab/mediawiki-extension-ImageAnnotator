
CREATE TABLE /*_*/annotatedimages (
  -- Key to page.page_id
  ai_id int(11) UNSIGNED NOT NULL  PRIMARY KEY AUTO_INCREMENT,
  ai_image_page_id int(11) UNSIGNED NOT NULL,
  ai_image_name TEXT NOT NULL,
  ai_hash VARCHAR(50) NOT NULL,
  ai_data_json TEXT NOT NULL,
  ai_data_svg TEXT NOT NULL ,
  ai_size int(11) UNSIGNED NOT NULL,
  ai_created varbinary(14) NOT NULL ,
  ai_job_queued varbinary(14) NOT NULL ,
  ai_job_end varbinary(14) NULL ,
  ai_is_generated BOOL DEFAULT 0 

) /*$wgDBTableOptions*/;

CREATE UNIQUE INDEX /*i*/annotatedimages_id ON /*_*/annotatedimages (ai_id);
CREATE INDEX /*i*/annotatedimages_page_id_hash ON /*_*/annotatedimages (ai_image_page_id,ai_hash);
CREATE INDEX /*i*/annotatedimages_page_id ON /*_*/annotatedimages (ai_image_page_id);
CREATE INDEX /*i*/annotatedimages_hash ON /*_*/annotatedimages (ai_hash);
CREATE INDEX /*i*/annotatedimages_size ON /*_*/annotatedimages (ai_size);


