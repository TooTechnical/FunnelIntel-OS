CREATE TABLE `awareness_diagnoses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`awarenessLevel` enum('unaware','problem_aware','solution_aware','product_aware'),
	`attentionMode` enum('passive','active'),
	`recommendedFunnelType` varchar(128),
	`explanation` text,
	`contentRecommendations` json,
	`firstMessageStrategy` text,
	`ctaStrategy` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `awareness_diagnoses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `buyer_journeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`stages` json,
	`rawOutput` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buyer_journeys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competitor_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`userAd` text,
	`competitorAd1` text,
	`competitorAd2` text,
	`topPlayerAd` text,
	`userLandingPage` text,
	`competitorLandingPage` text,
	`reviewQuestions` json,
	`insiderFeedback` json,
	`winningVariation` varchar(128),
	`whyItWon` text,
	`thresholdIssue` enum('desire','certainty','trust'),
	`revisionRecommendation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competitor_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `draft_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`assetType` enum('social_ad','social_ad_visual','google_ad','landing_page','offer_section','cta_buttons','email_sequence','outreach_dm','sales_call_script','faq','follow_up') NOT NULL,
	`elementName` varchar(255),
	`elementJob` text,
	`mentalStep` text,
	`thresholdAffected` enum('desire','certainty','trust','attention'),
	`primaryCopy` text,
	`variations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `draft_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnel_skeletons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`funnelType` varchar(128),
	`sections` json,
	`adAssets` json,
	`rawOutput` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funnel_skeletons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intelligence_extracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`currentState` json,
	`dreamState` json,
	`roadblocks` json,
	`previousSolutions` json,
	`competitorProducts` json,
	`exactPhrases` json,
	`pains` json,
	`desires` json,
	`objections` json,
	`trustFears` json,
	`buyingTriggers` json,
	`decisionMoments` json,
	`emotionalLanguage` json,
	`repeatedThemes` json,
	`marketingAngles` json,
	`awarenessLevel` enum('unaware','problem_aware','solution_aware','product_aware'),
	`confidenceScore` int,
	`rawOutput` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `intelligence_extracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interview_builders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`knowledgeGaps` json,
	`interviewTypes` json,
	`outreachMessages` json,
	`buyerQuestions` json,
	`nonBuyerQuestions` json,
	`followUpProbes` json,
	`notesTemplate` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interview_builders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_research_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`currentState` json,
	`dreamState` json,
	`roadblocks` json,
	`solutions` json,
	`productsBusinesses` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `market_research_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mental_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`steps` json,
	`rawOutput` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mental_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`businessName` varchar(255),
	`industry` varchar(255),
	`productService` text,
	`targetCustomer` text,
	`desiredAction` text,
	`mainOffer` text,
	`funnelType` varchar(128),
	`status` enum('research','buyer_journey','funnel_strategy','drafting','review','ready_to_launch') NOT NULL DEFAULT 'research',
	`researchComplete` boolean DEFAULT false,
	`intelligenceComplete` boolean DEFAULT false,
	`buyerJourneyComplete` boolean DEFAULT false,
	`awarenessComplete` boolean DEFAULT false,
	`thresholdComplete` boolean DEFAULT false,
	`mentalStepsComplete` boolean DEFAULT false,
	`funnelSkeletonComplete` boolean DEFAULT false,
	`draftingComplete` boolean DEFAULT false,
	`selfReviewComplete` boolean DEFAULT false,
	`competitorReviewComplete` boolean DEFAULT false,
	`exportComplete` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `research_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`sourceType` enum('customer_review','interview_notes','sales_call_transcript','reddit_comment','youtube_comment','trustpilot_review','google_review','competitor_copy','client_notes','testimonial','survey_answer','general_market_research','other') NOT NULL,
	`content` text NOT NULL,
	`url` varchar(2048),
	`fileKey` varchar(512),
	`fileUrl` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `research_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `self_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`draftAssetId` int,
	`reviewContent` text,
	`lizardBrainScore` int,
	`batonHandoffScore` int,
	`thresholdScore` int,
	`languageScore` int,
	`finalScore` int,
	`overallScore` int,
	`issues` json,
	`suggestedFixes` json,
	`rewrittenVersion` text,
	`readinessScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `self_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `threshold_gaps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`currentDesire` int,
	`requiredDesire` int,
	`currentCertainty` int,
	`requiredCertainty` int,
	`currentTrust` int,
	`requiredTrust` int,
	`biggestGap` enum('desire','certainty','trust'),
	`funnelFocus` text,
	`recommendations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `threshold_gaps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `trialStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `trialEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('trial','active','expired','cancelled','none') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('starter','pro','agency');--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionCurrentPeriodEnd` timestamp;