--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Debian 14.13-1.pgdg110+1)
-- Dumped by pg_dump version 14.13 (Debian 14.13-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: dev
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO dev;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: dev
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO dev;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: dev
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO dev;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: dev
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: assignee_type_enum; Type: TYPE; Schema: public; Owner: dev
--

CREATE TYPE public.assignee_type_enum AS ENUM (
    'USER',
    'TEAM'
);


ALTER TYPE public.assignee_type_enum OWNER TO dev;

--
-- Name: assignment_status_enum; Type: TYPE; Schema: public; Owner: dev
--

CREATE TYPE public.assignment_status_enum AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.assignment_status_enum OWNER TO dev;

--
-- Name: media_type_enum; Type: TYPE; Schema: public; Owner: dev
--

CREATE TYPE public.media_type_enum AS ENUM (
    'image',
    'video',
    'document',
    'other'
);


ALTER TYPE public.media_type_enum OWNER TO dev;

--
-- Name: municipality_department_enum; Type: TYPE; Schema: public; Owner: dev
--

CREATE TYPE public.municipality_department_enum AS ENUM (
    'ROADS_AND_INFRASTRUCTURE',
    'PLANNING_URBANIZATION',
    'PARKS_AND_GARDENS',
    'ENVIRONMENTAL_PROTECTION',
    'TRANSPORTATION_SERVICES',
    'TRAFFIC_SERVICES',
    'WATER_AND_SEWERAGE',
    'STREET_LIGHTING',
    'CLEANING_SERVICES',
    'MUNICIPAL_POLICE',
    'FIRE_DEPARTMENT',
    'HEALTH_AFFAIRS',
    'VETERINARY_SERVICES',
    'SOCIAL_ASSISTANCE',
    'CULTURE_AND_SOCIAL_AFFAIRS',
    'GENERAL_AFFAIRS'
);


ALTER TYPE public.municipality_department_enum OWNER TO dev;

--
-- Name: report_status_enum; Type: TYPE; Schema: public; Owner: dev
--

CREATE TYPE public.report_status_enum AS ENUM (
    'OPEN',
    'IN_REVIEW',
    'IN_PROGRESS',
    'DONE',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public.report_status_enum OWNER TO dev;

--
-- Name: report_type_enum; Type: TYPE; Schema: public; Owner: dev
--

CREATE TYPE public.report_type_enum AS ENUM (
    'POTHOLE',
    'SIDEWALK_DAMAGE',
    'ROAD_DAMAGE',
    'ROAD_SIGN',
    'ROAD_MARKING',
    'TRAFFIC_LIGHT',
    'ROAD_BLOCK',
    'STREET_LIGHT',
    'ELECTRICITY_OUTAGE',
    'WATER_LEAKAGE',
    'DRAINAGE_BLOCKAGE',
    'SEWER_LEAKAGE',
    'GARBAGE_COLLECTION',
    'LITTER',
    'DUMPING',
    'GRAFFITI',
    'AIR_POLLUTION',
    'PARK_DAMAGE',
    'TREE_ISSUE',
    'PUBLIC_TRANSPORT',
    'PUBLIC_TRANSPORT_STOP',
    'PARKING_VIOLATION',
    'TRAFFIC_CONGESTION',
    'ANIMAL_CONTROL',
    'NOISE_COMPLAINT',
    'OTHER'
);


ALTER TYPE public.report_type_enum OWNER TO dev;

--
-- Name: team_status_enum; Type: TYPE; Schema: public; Owner: dev
--

CREATE TYPE public.team_status_enum AS ENUM (
    'AVAILABLE',
    'ON_DUTY',
    'OFF_DUTY',
    'INACTIVE'
);


ALTER TYPE public.team_status_enum OWNER TO dev;

--
-- Name: user_roles_enum; Type: TYPE; Schema: public; Owner: dev
--

CREATE TYPE public.user_roles_enum AS ENUM (
    'CITIZEN',
    'TEAM_MEMBER',
    'DEPARTMENT_SUPERVISOR',
    'SYSTEM_ADMIN'
);


ALTER TYPE public.user_roles_enum OWNER TO dev;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.assignments (
    id integer NOT NULL,
    report_id integer NOT NULL,
    assignee_type public.assignee_type_enum NOT NULL,
    assignee_user_id integer,
    assignee_team_id integer,
    assigned_by_user_id integer,
    assignment_status public.assignment_status_enum DEFAULT 'ACTIVE'::public.assignment_status_enum NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    accepted_at timestamp with time zone,
    completed_at timestamp with time zone,
    rejected_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    CONSTRAINT "CHK_assignments_assignee_type_and_ids" CHECK ((((assignee_type = 'USER'::public.assignee_type_enum) AND (assignee_user_id IS NOT NULL) AND (assignee_team_id IS NULL)) OR ((assignee_type = 'TEAM'::public.assignee_type_enum) AND (assignee_team_id IS NOT NULL) AND (assignee_user_id IS NULL))))
);


ALTER TABLE public.assignments OWNER TO dev;

--
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.assignments_id_seq OWNER TO dev;

--
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- Name: department_history; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.department_history (
    id integer NOT NULL,
    report_id integer NOT NULL,
    previous_department_id integer,
    new_department_id integer NOT NULL,
    reason text,
    changed_by_user_id integer,
    changed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.department_history OWNER TO dev;

--
-- Name: department_history_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.department_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.department_history_id_seq OWNER TO dev;

--
-- Name: department_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.department_history_id_seq OWNED BY public.department_history.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    code public.municipality_department_enum NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    responsible_report_types jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.departments OWNER TO dev;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_id_seq OWNER TO dev;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.media (
    id integer NOT NULL,
    filename character varying(255) NOT NULL,
    originalname character varying(255) NOT NULL,
    url character varying(500) NOT NULL,
    mimetype character varying(100) NOT NULL,
    type public.media_type_enum DEFAULT 'other'::public.media_type_enum NOT NULL,
    size integer NOT NULL,
    metadata jsonb,
    thumbnail_url character varying(500),
    width integer,
    height integer,
    bucket_name character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.media OWNER TO dev;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.media_id_seq OWNER TO dev;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO dev;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO dev;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: report_categories; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.report_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    icon character varying(50),
    parent_id integer,
    department_id integer NOT NULL,
    default_report_type public.report_type_enum DEFAULT 'OTHER'::public.report_type_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.report_categories OWNER TO dev;

--
-- Name: report_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.report_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.report_categories_id_seq OWNER TO dev;

--
-- Name: report_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.report_categories_id_seq OWNED BY public.report_categories.id;


--
-- Name: report_medias; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.report_medias (
    id integer NOT NULL,
    report_id integer NOT NULL,
    url character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.report_medias OWNER TO dev;

--
-- Name: report_medias_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.report_medias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.report_medias_id_seq OWNER TO dev;

--
-- Name: report_medias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.report_medias_id_seq OWNED BY public.report_medias.id;


--
-- Name: report_status_history; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.report_status_history (
    id integer NOT NULL,
    report_id integer NOT NULL,
    previous_status public.report_status_enum,
    new_status public.report_status_enum NOT NULL,
    previous_sub_status character varying(255),
    new_sub_status character varying(255),
    changed_by_user_id integer,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text
);


ALTER TABLE public.report_status_history OWNER TO dev;

--
-- Name: report_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.report_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.report_status_history_id_seq OWNER TO dev;

--
-- Name: report_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.report_status_history_id_seq OWNED BY public.report_status_history.id;


--
-- Name: report_supports; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.report_supports (
    id integer NOT NULL,
    report_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.report_supports OWNER TO dev;

--
-- Name: report_supports_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.report_supports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.report_supports_id_seq OWNER TO dev;

--
-- Name: report_supports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.report_supports_id_seq OWNED BY public.report_supports.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text NOT NULL,
    location public.geometry(Point,4326) NOT NULL,
    address character varying(255) NOT NULL,
    report_type public.report_type_enum,
    department_code public.municipality_department_enum NOT NULL,
    category_id integer NOT NULL,
    status public.report_status_enum DEFAULT 'OPEN'::public.report_status_enum NOT NULL,
    sub_status character varying(40),
    support_count integer DEFAULT 0 NOT NULL,
    current_department_id integer NOT NULL,
    user_id integer NOT NULL,
    closed_by_user_id integer,
    resolution_notes text,
    rejection_reason text,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reports OWNER TO dev;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reports_id_seq OWNER TO dev;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: specializations; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.specializations (
    id integer NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    typical_department_code character varying(100),
    example_source character varying(255)
);


ALTER TABLE public.specializations OWNER TO dev;

--
-- Name: specializations_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.specializations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.specializations_id_seq OWNER TO dev;

--
-- Name: specializations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.specializations_id_seq OWNED BY public.specializations.id;


--
-- Name: team_membership_history; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.team_membership_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    team_id integer NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    left_at timestamp with time zone,
    role_in_team character varying(100)
);


ALTER TABLE public.team_membership_history OWNER TO dev;

--
-- Name: team_membership_history_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.team_membership_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_membership_history_id_seq OWNER TO dev;

--
-- Name: team_membership_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.team_membership_history_id_seq OWNED BY public.team_membership_history.id;


--
-- Name: team_specializations; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.team_specializations (
    team_id integer NOT NULL,
    specialization_id integer NOT NULL
);


ALTER TABLE public.team_specializations OWNER TO dev;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    department_id integer NOT NULL,
    team_leader_id integer,
    status public.team_status_enum DEFAULT 'AVAILABLE'::public.team_status_enum NOT NULL,
    base_location public.geometry(Point,4326),
    current_location public.geometry(Point,4326),
    last_location_update timestamp with time zone
);


ALTER TABLE public.teams OWNER TO dev;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teams_id_seq OWNER TO dev;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    phone_number character varying(20),
    avatar character varying(255),
    roles public.user_roles_enum[] DEFAULT '{CITIZEN}'::public.user_roles_enum[] NOT NULL,
    is_email_verified boolean DEFAULT false NOT NULL,
    password character varying(255) NOT NULL,
    email_verification_token character varying(255),
    password_reset_token character varying(255),
    password_reset_expires timestamp without time zone,
    department_id integer,
    active_team_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    last_login_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO dev;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO dev;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- Name: department_history id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.department_history ALTER COLUMN id SET DEFAULT nextval('public.department_history_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: report_categories id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_categories ALTER COLUMN id SET DEFAULT nextval('public.report_categories_id_seq'::regclass);


--
-- Name: report_medias id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_medias ALTER COLUMN id SET DEFAULT nextval('public.report_medias_id_seq'::regclass);


--
-- Name: report_status_history id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_status_history ALTER COLUMN id SET DEFAULT nextval('public.report_status_history_id_seq'::regclass);


--
-- Name: report_supports id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_supports ALTER COLUMN id SET DEFAULT nextval('public.report_supports_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: specializations id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.specializations ALTER COLUMN id SET DEFAULT nextval('public.specializations_id_seq'::regclass);


--
-- Name: team_membership_history id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.team_membership_history ALTER COLUMN id SET DEFAULT nextval('public.team_membership_history_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.assignments (id, report_id, assignee_type, assignee_user_id, assignee_team_id, assigned_by_user_id, assignment_status, assigned_at, accepted_at, completed_at, rejected_at, cancelled_at) FROM stdin;
1	1	USER	3	\N	2	ACTIVE	2025-06-05 00:25:56.238+00	2025-06-05 00:25:56.238+00	\N	\N	\N
\.


--
-- Data for Name: department_history; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.department_history (id, report_id, previous_department_id, new_department_id, reason, changed_by_user_id, changed_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.departments (id, code, name, description, is_active, responsible_report_types, created_at, updated_at) FROM stdin;
1	GENERAL_AFFAIRS	Genel Konular / Di─şer	S─▒n─▒fland─▒r─▒lmam─▒┼ş ┼şikayetlerin ilk y├Ânlendirildi─şi birim	t	["OTHER"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
2	ROADS_AND_INFRASTRUCTURE	Fen ─░┼şleri ve Altyap─▒ M├╝d├╝rl├╝─ş├╝	Yollar, kald─▒r─▒mlar ve temel altyap─▒ ile ilgili sorunlar─▒n ├ğ├Âz├╝m birimi	t	["POTHOLE", "SIDEWALK_DAMAGE", "ROAD_DAMAGE", "ROAD_MARKING", "ROAD_BLOCK"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
3	PLANNING_URBANIZATION	─░mar ve ┼Şehircilik M├╝d├╝rl├╝─ş├╝	─░mar planlar─▒, yap─▒ denetimi ve ┼şehircilik konular─▒	t	["OTHER"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
4	WATER_AND_SEWERAGE	Su ve Kanalizasyon ─░┼şleri M├╝d├╝rl├╝─ş├╝	Su, kanalizasyon ve su bask─▒n─▒ ile ilgili sorunlar	t	["WATER_LEAKAGE", "DRAINAGE_BLOCKAGE", "SEWER_LEAKAGE"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
5	STREET_LIGHTING	Elektrik ve Ayd─▒nlatma M├╝d├╝rl├╝─ş├╝	Elektrik ve ayd─▒nlatma sorunlar─▒	t	["ELECTRICITY_OUTAGE", "STREET_LIGHT"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
6	PARKS_AND_GARDENS	Park ve Bah├ğeler M├╝d├╝rl├╝─ş├╝	Parklar, ye┼şil alanlar ve a─şa├ğlar ile ilgili sorunlar	t	["TREE_ISSUE", "PARK_DAMAGE"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
7	ENVIRONMENTAL_PROTECTION	├çevre Koruma ve Kontrol M├╝d├╝rl├╝─ş├╝	├çevre koruma ve kontrol ile ilgili sorunlar	t	["AIR_POLLUTION", "DUMPING"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
8	CLEANING_SERVICES	Temizlik ─░┼şleri M├╝d├╝rl├╝─ş├╝	├çevre temizli─şi ve at─▒k y├Ânetimi sorunlar─▒	t	["GARBAGE_COLLECTION", "LITTER", "GRAFFITI"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
9	TRANSPORTATION_SERVICES	Ula┼ş─▒m Hizmetleri M├╝d├╝rl├╝─ş├╝	Toplu ta┼ş─▒ma ve ula┼ş─▒m sorunlar─▒	t	["PUBLIC_TRANSPORT", "PUBLIC_TRANSPORT_STOP", "PARKING_VIOLATION", "TRAFFIC_CONGESTION"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
10	TRAFFIC_SERVICES	Trafik Hizmetleri M├╝d├╝rl├╝─ş├╝	Trafik d├╝zeni ve kontrol sorunlar─▒	t	["TRAFFIC_LIGHT", "ROAD_SIGN", "PARKING_VIOLATION", "TRAFFIC_CONGESTION"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
11	MUNICIPAL_POLICE	Zab─▒ta M├╝d├╝rl├╝─ş├╝	Belediye zab─▒tas─▒ ile ilgili konular	t	["NOISE_COMPLAINT", "PARKING_VIOLATION"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
12	FIRE_DEPARTMENT	─░tfaiye Daire Ba┼şkanl─▒─ş─▒	─░tfaiye ve acil m├╝dahale hizmetleri	t	["OTHER"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
13	HEALTH_AFFAIRS	Sa─şl─▒k ─░┼şleri M├╝d├╝rl├╝─ş├╝	Halk sa─şl─▒─ş─▒ ve sa─şl─▒k hizmetleri	t	["OTHER"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
14	VETERINARY_SERVICES	Veteriner ─░┼şleri M├╝d├╝rl├╝─ş├╝	Hayvanlarla ilgili hizmetler	t	["ANIMAL_CONTROL"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
15	SOCIAL_ASSISTANCE	Sosyal Yard─▒m ─░┼şleri M├╝d├╝rl├╝─ş├╝	Sosyal yard─▒m ve destek hizmetleri	t	["OTHER"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
16	CULTURE_AND_SOCIAL_AFFAIRS	K├╝lt├╝r ve Sosyal ─░┼şler M├╝d├╝rl├╝─ş├╝	K├╝lt├╝rel etkinlikler ve sosyal faaliyetler	t	["OTHER"]	2025-06-05 00:25:55.251272	2025-06-05 00:25:55.251272
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.media (id, filename, originalname, url, mimetype, type, size, metadata, thumbnail_url, width, height, bucket_name, created_at, updated_at) FROM stdin;
1	1749083590112-w4st81ree6m.jpeg	character design avatar ideas.jpeg	http://localhost:9000/public/1749083590112-w4st81ree6m.jpeg	image/jpeg	image	138389	{"size": 138389, "width": 736, "format": "jpeg", "height": 1309, "mimetype": "image/jpeg", "originalname": "character design avatar ideas.jpeg"}	http://localhost:9000/public/thumb_1749083590063-iqodoyhxqe.jpg	736	1309	public	2025-06-05 00:33:10.181959	2025-06-05 00:33:10.181959
2	1749085093136-rmcn1nfx4q.png	Ekran g├â┬Âr├â┬╝nt├â┬╝s├â┬╝ 2025-06-05 001244.png	http://localhost:9000/public/1749085093136-rmcn1nfx4q.png	image/png	image	46068	{"size": 46068, "width": 1200, "format": "jpeg", "height": 638, "mimetype": "image/png", "originalname": "Ekran g├â┬Âr├â┬╝nt├â┬╝s├â┬╝ 2025-06-05 001244.png"}	http://localhost:9000/public/thumb_1749085093090-028wmmu83r0f.jpg	1200	638	public	2025-06-05 00:58:13.198971	2025-06-05 00:58:13.198971
3	1749340555097-ben7cw7kj5b.png	Ekran g├â┬Âr├â┬╝nt├â┬╝s├â┬╝ 2024-11-02 005539.png	http://localhost:9000/public/1749340555097-ben7cw7kj5b.png	image/png	image	20883	{"size": 20883, "width": 360, "format": "jpeg", "height": 346, "mimetype": "image/png", "originalname": "Ekran g├â┬Âr├â┬╝nt├â┬╝s├â┬╝ 2024-11-02 005539.png"}	http://localhost:9000/public/thumb_1749340554917-rwafujzb8m.jpg	360	346	public	2025-06-07 23:55:55.163784	2025-06-07 23:55:55.163784
4	1749340745513-wg4tcnzdo9q.png	Ekran g├â┬Âr├â┬╝nt├â┬╝s├â┬╝ 2024-11-02 005747.png	http://localhost:9000/public/1749340745513-wg4tcnzdo9q.png	image/png	image	2370	{"size": 2370, "width": 151, "format": "jpeg", "height": 50, "mimetype": "image/png", "originalname": "Ekran g├â┬Âr├â┬╝nt├â┬╝s├â┬╝ 2024-11-02 005747.png"}	http://localhost:9000/public/thumb_1749340745467-d0mayc6aphf.jpg	151	50	public	2025-06-07 23:59:05.570957	2025-06-07 23:59:05.570957
5	1749340745506-slbakf92u9f.png	Ekran g├â┬Âr├â┬╝nt├â┬╝s├â┬╝ 2024-11-02 005539.png	http://localhost:9000/public/1749340745506-slbakf92u9f.png	image/png	image	20883	{"size": 20883, "width": 360, "format": "jpeg", "height": 346, "mimetype": "image/png", "originalname": "Ekran g├â┬Âr├â┬╝nt├â┬╝s├â┬╝ 2024-11-02 005539.png"}	http://localhost:9000/public/thumb_1749340745475-e3ns57d7dth.jpg	360	346	public	2025-06-07 23:59:05.641484	2025-06-07 23:59:05.641484
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	240601120000	FinalizeCoreSchemaAndConstraints20240601120000
\.


--
-- Data for Name: report_categories; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.report_categories (id, name, code, description, icon, parent_id, department_id, default_report_type, is_active, sort_order, created_at, updated_at) FROM stdin;
1	Yol ve Kald─▒r─▒m Sorunlar─▒	ROADS_SIDEWALKS	Yollar ve kald─▒r─▒mlardaki hasarlar	fa-road	\N	2	ROAD_DAMAGE	t	10	2025-06-05 00:25:55.345112	2025-06-05 00:25:55.345112
2	├çukur	POTHOLE	Yollardaki ├ğukurlar	fa-exclamation-triangle	\N	2	POTHOLE	t	11	2025-06-05 00:25:55.369254	2025-06-05 00:25:55.369254
3	Kald─▒r─▒m Hasar─▒	SIDEWALK_DAMAGE	Kald─▒r─▒mlardaki hasarlar	fa-walking	\N	2	SIDEWALK_DAMAGE	t	12	2025-06-05 00:25:55.383561	2025-06-05 00:25:55.383561
4	Su Ar─▒zalar─▒	WATER_ISSUES	Su s─▒z─▒nt─▒s─▒ ve ar─▒zalar─▒	fa-tint	\N	4	WATER_LEAKAGE	t	20	2025-06-05 00:25:55.397168	2025-06-05 00:25:55.397168
5	Kanalizasyon Sorunlar─▒	SEWER_ISSUES	Kanalizasyon t─▒kan─▒kl─▒─ş─▒ ve sorunlar─▒	fa-exclamation-circle	\N	4	SEWER_LEAKAGE	t	21	2025-06-05 00:25:55.410812	2025-06-05 00:25:55.410812
6	Sokak Ayd─▒nlatmas─▒	STREET_LIGHTING	Sokak lambas─▒ ar─▒zalar─▒	fa-lightbulb	\N	5	STREET_LIGHT	t	30	2025-06-05 00:25:55.426158	2025-06-05 00:25:55.426158
7	Elektrik Kesintisi	ELECTRICITY_OUTAGE	Elektrik kesintisi ve ar─▒zalar	fa-bolt	\N	5	ELECTRICITY_OUTAGE	t	31	2025-06-05 00:25:55.442069	2025-06-05 00:25:55.442069
8	Park ve Bah├ğe Sorunlar─▒	PARK_GARDEN_ISSUES	Park ve ye┼şil alan sorunlar─▒	fa-tree	\N	6	PARK_DAMAGE	t	40	2025-06-05 00:25:55.456844	2025-06-05 00:25:55.456844
9	A─şa├ğ Sorunlar─▒	TREE_ISSUES	Tehlikeli a─şa├ğlar ve bitki sorunlar─▒	fa-tree	\N	6	TREE_ISSUE	t	41	2025-06-05 00:25:55.471294	2025-06-05 00:25:55.471294
10	├ç├Âp Toplama	GARBAGE_COLLECTION	├ç├Âp toplama ve at─▒k sorunlar─▒	fa-trash	\N	8	GARBAGE_COLLECTION	t	50	2025-06-05 00:25:55.484484	2025-06-05 00:25:55.484484
11	├çevre Kirlili─şi	POLLUTION	├çevre kirlili─şi ve at─▒k y─▒─ş─▒n─▒	fa-smog	\N	7	AIR_POLLUTION	t	51	2025-06-05 00:25:55.498438	2025-06-05 00:25:55.498438
12	Grafiti	GRAFFITI	─░zinsiz duvar yaz─▒lar─▒	fa-spray-can	\N	8	GRAFFITI	t	52	2025-06-05 00:25:55.514307	2025-06-05 00:25:55.514307
13	Toplu Ta┼ş─▒ma	PUBLIC_TRANSPORT	Otob├╝s ve toplu ta┼ş─▒ma sorunlar─▒	fa-bus	\N	9	PUBLIC_TRANSPORT	t	60	2025-06-05 00:25:55.528014	2025-06-05 00:25:55.528014
14	Trafik Sorunlar─▒	TRAFFIC_ISSUES	Trafik ─▒┼ş─▒─ş─▒ ve trafik sorunlar─▒	fa-traffic-light	\N	10	TRAFFIC_LIGHT	t	61	2025-06-05 00:25:55.543973	2025-06-05 00:25:55.543973
15	Park ─░hlali	PARKING_VIOLATION	Yasak park ve park ihlalleri	fa-parking	\N	11	PARKING_VIOLATION	t	62	2025-06-05 00:25:55.55945	2025-06-05 00:25:55.55945
16	G├╝r├╝lt├╝ ┼Şikayeti	NOISE_COMPLAINT	G├╝r├╝lt├╝ kirlili─şi ┼şikayetleri	fa-volume-up	\N	11	NOISE_COMPLAINT	t	63	2025-06-05 00:25:55.573998	2025-06-05 00:25:55.573998
17	Di─şer	OTHER	Di─şer kategorilere girmeyen sorunlar	fa-question-circle	\N	1	OTHER	t	999	2025-06-05 00:25:55.585912	2025-06-05 00:25:55.585912
\.


--
-- Data for Name: report_medias; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.report_medias (id, report_id, url, type, created_at, updated_at) FROM stdin;
1	1	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
2	1	https://storage.kentnabiz.com/rapor-fotograflari/kanalizasyon.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
3	2	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
4	3	https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
5	3	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
6	4	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
7	4	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
8	4	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
9	5	https://storage.kentnabiz.com/rapor-fotograflari/yol-cukur.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
10	5	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
11	5	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
12	6	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
13	6	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
14	6	https://storage.kentnabiz.com/rapor-fotograflari/trafik-isigi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
15	7	https://storage.kentnabiz.com/rapor-fotograflari/cop-birikimi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
16	8	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
17	8	https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
18	8	https://storage.kentnabiz.com/rapor-fotograflari/trafik-isigi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
19	9	https://storage.kentnabiz.com/rapor-fotograflari/yol-cukur.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
20	9	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
21	9	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
22	10	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
23	10	https://storage.kentnabiz.com/rapor-fotograflari/trafik-isigi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
24	10	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
25	11	https://storage.kentnabiz.com/rapor-fotograflari/trafik-isigi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
26	12	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
27	12	https://storage.kentnabiz.com/rapor-fotograflari/trafik-isigi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
28	12	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
29	13	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
30	14	https://storage.kentnabiz.com/rapor-fotograflari/yol-cukur.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
31	15	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
32	15	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
33	16	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
34	16	https://storage.kentnabiz.com/rapor-fotograflari/kanalizasyon.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
35	16	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
36	17	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
37	17	https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
38	17	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
39	18	https://storage.kentnabiz.com/rapor-fotograflari/kaldirim-bozuk.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
40	18	https://storage.kentnabiz.com/rapor-fotograflari/kaldirim-bozuk.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
41	18	https://storage.kentnabiz.com/rapor-fotograflari/kaldirim-bozuk.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
42	19	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
43	19	https://storage.kentnabiz.com/rapor-fotograflari/kaldirim-bozuk.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
44	20	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
45	20	https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
46	20	https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
47	21	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
48	21	https://storage.kentnabiz.com/rapor-fotograflari/cop-birikimi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
49	22	https://storage.kentnabiz.com/rapor-fotograflari/trafik-isigi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
50	23	https://storage.kentnabiz.com/rapor-fotograflari/kaldirim-bozuk.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
51	23	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
52	23	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
53	24	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
54	24	https://storage.kentnabiz.com/rapor-fotograflari/trafik-isigi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
55	25	https://storage.kentnabiz.com/rapor-fotograflari/kanalizasyon.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
56	25	https://storage.kentnabiz.com/rapor-fotograflari/kanalizasyon.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
57	26	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
58	26	https://storage.kentnabiz.com/rapor-fotograflari/kanalizasyon.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
59	27	https://storage.kentnabiz.com/rapor-fotograflari/cop-birikimi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
60	28	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
61	29	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
62	30	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
63	31	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
64	31	https://storage.kentnabiz.com/rapor-fotograflari/yol-cukur.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
65	31	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
66	32	https://storage.kentnabiz.com/rapor-fotograflari/kanalizasyon.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
67	32	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
68	33	https://storage.kentnabiz.com/rapor-fotograflari/yol-cukur.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
69	33	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
70	34	https://storage.kentnabiz.com/rapor-fotograflari/kanalizasyon.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
71	35	https://storage.kentnabiz.com/rapor-fotograflari/kaldirim-bozuk.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
72	35	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
73	35	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
74	36	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
75	37	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
76	38	https://storage.kentnabiz.com/rapor-fotograflari/yol-cukur.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
77	38	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
78	38	https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
79	39	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
80	39	https://storage.kentnabiz.com/rapor-fotograflari/yol-cukur.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
81	39	https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
82	40	https://storage.kentnabiz.com/rapor-fotograflari/kanalizasyon.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
83	41	https://storage.kentnabiz.com/rapor-fotograflari/trafik-isigi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
84	41	https://storage.kentnabiz.com/rapor-fotograflari/trafik-isigi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
85	42	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
86	43	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
87	43	https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
88	43	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
89	44	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
90	45	https://storage.kentnabiz.com/rapor-fotograflari/kanalizasyon.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
91	45	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
92	46	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
93	46	https://storage.kentnabiz.com/rapor-fotograflari/cop-birikimi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
94	47	https://storage.kentnabiz.com/rapor-fotograflari/yol-cukur.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
95	47	https://storage.kentnabiz.com/rapor-fotograflari/cop-birikimi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
96	47	https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
97	48	https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
98	48	https://storage.kentnabiz.com/rapor-fotograflari/kaldirim-bozuk.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
99	48	https://storage.kentnabiz.com/rapor-fotograflari/cop-birikimi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
100	49	https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
101	49	https://storage.kentnabiz.com/rapor-fotograflari/yol-cukur.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
102	49	https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
103	50	https://storage.kentnabiz.com/rapor-fotograflari/kaldirim-bozuk.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
104	50	https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
105	50	https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg	image/jpeg	2025-06-05 00:25:56.183416	2025-06-05 00:25:56.183416
106	51	http://localhost:9000/public/1749083590112-w4st81ree6m.jpeg	image/jpeg	2025-06-05 00:33:12.964471	2025-06-05 00:33:12.964471
107	52	http://localhost:9000/public/1749085093136-rmcn1nfx4q.png	image/png	2025-06-05 00:58:16.393147	2025-06-05 00:58:16.393147
108	53	http://localhost:9000/public/1749340745506-slbakf92u9f.png	image	2025-06-07 23:59:38.157657	2025-06-07 23:59:38.157657
109	53	http://localhost:9000/public/1749340745513-wg4tcnzdo9q.png	image	2025-06-07 23:59:38.157657	2025-06-07 23:59:38.157657
\.


--
-- Data for Name: report_status_history; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.report_status_history (id, report_id, previous_status, new_status, previous_sub_status, new_sub_status, changed_by_user_id, changed_at, notes) FROM stdin;
1	51	\N	OPEN	\N	\N	5	2025-06-05 00:33:13.09+00	Report created
2	52	\N	OPEN	\N	\N	5	2025-06-05 00:58:16.512+00	Report created
3	53	\N	OPEN	\N	\N	6	2025-06-07 23:59:39.764+00	Report created
\.


--
-- Data for Name: report_supports; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.report_supports (id, report_id, user_id, created_at) FROM stdin;
1	30	5	2025-06-05 00:30:19.704189
2	50	5	2025-06-05 00:33:48.545037
3	50	1	2025-06-05 00:37:22.156841
7	52	1	2025-06-05 05:45:49.643793
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.reports (id, title, description, location, address, report_type, department_code, category_id, status, sub_status, support_count, current_department_id, user_id, closed_by_user_id, resolution_notes, rejection_reason, resolved_at, created_at, updated_at) FROM stdin;
1	Kald─▒r─▒m Bozulmu┼ş - Okul Sokak	Kald─▒r─▒mda b├╝y├╝k bir ├ğ├Âkme meydana gelmi┼ş, yayalar─▒n ge├ği┼şi tehlikeli. Mollitia itaque expedita reprehenderit. Perferendis quasi nemo. Ipsum nam rerum.	0101000020E61000000A68226C78FA3C40E2E995B20C814440	Taksim Meydan─▒, Beyo─şlu, 30 A─şustos Caddesi 257	ROAD_DAMAGE	ROADS_AND_INFRASTRUCTURE	1	OPEN	\N	0	1	2	\N	\N	\N	\N	2025-06-02 07:46:13.497	2025-06-02 07:46:13.497
2	Sokak Lambas─▒ Yanm─▒yor - Kald─▒r─▒m Sokak	Sokak lambas─▒ ├╝├ğ g├╝nd├╝r yanm─▒yor, ak┼şamlar─▒ sokak tamamen karanl─▒k. Exercitationem harum earum labore occaecati. Omnis deleniti magnam necessitatibus fugiat voluptatum necessitatibus voluptatibus eius. Sit numquam fugiat eum suscipit quaerat labore.	0101000020E610000024287E8CB9FB3C40DC68006F81844440	┼Şi┼şli Merkez, ─░stanbul, Bar─▒┼ş Sokak 196	STREET_LIGHT	STREET_LIGHTING	2	CANCELLED	\N	0	2	2	\N	\N	\N	\N	2025-06-03 00:04:20.361	2025-06-03 00:04:20.361
3	├ç├Âpler Toplanmad─▒ - Sar─▒kaya Caddesi	├£├ğ g├╝nd├╝r ├ğ├Âpler al─▒nmad─▒, k├Ât├╝ koku ve ├ğevre kirlili─şi olu┼şuyor. Iusto officiis assumenda eligendi. Fuga neque labore quaerat dolorem. Quaerat possimus ab impedit sunt a magni vel dolore.	0101000020E6100000BC0512143F063D409B559FABAD804440	Ba─şdat Caddesi, Kad─▒k├Ây, Afyon Kaya Sokak 2	GARBAGE_COLLECTION	CLEANING_SERVICES	3	OPEN	\N	0	3	2	\N	\N	\N	\N	2025-06-03 17:16:35.794	2025-06-03 17:16:35.794
4	Su Borusu Patlam─▒┼ş - Bar─▒┼ş Sokak	Ana su borusu patlam─▒┼ş durumda, sokak su i├ğinde kald─▒. Illo aperiam distinctio. Labore quod fugiat. Hic inventore iure iure quaerat accusantium inventore saepe temporibus molestias.	0101000020E6100000D7A3703D0A173D408AB0E1E995824440	├£sk├╝dar Merkez, ─░stanbul, 30 A─şustos Caddesi 66	WATER_LEAKAGE	WATER_AND_SEWERAGE	4	DONE	\N	0	1	3	\N	\N	\N	\N	2025-06-04 19:35:33.4	2025-06-04 19:35:33.4
5	Yol ├çukurlarla Dolu - Fatih Sokak	Yolda derin ├ğukurlar olu┼şmu┼ş, ara├ğlar zarar g├Âr├╝yor. Sapiente quia repudiandae doloribus accusantium tenetur repellat. A atque minima. Assumenda reprehenderit in amet sequi necessitatibus dolor in.	0101000020E61000007FD93D7958F83C40287E8CB96B814440	Galata Kulesi, Beyo─şlu, Bay─▒r Sokak 298	POTHOLE	ROADS_AND_INFRASTRUCTURE	5	IN_PROGRESS	\N	0	2	2	\N	\N	\N	\N	2025-06-02 19:23:18.728	2025-06-02 19:23:18.728
6	A─şa├ğ Devrilme Tehlikesi - Tevfik Fikret Caddesi	F─▒rt─▒nadan dolay─▒ a─şa├ğ yan yatm─▒┼ş, devrilme tehlikesi var. Saepe necessitatibus eaque cupiditate atque molestias necessitatibus eius harum. Consectetur deleniti perferendis officiis tempora sapiente nobis ad possimus. Aliquid alias possimus voluptates modi.	0101000020E610000048BF7D1D38073D4058A835CD3B7E4440	Bostanc─▒ Sahil, Kad─▒k├Ây, Sayg─▒l─▒ Sokak 63c	TREE_ISSUE	PARKS_AND_GARDENS	6	CANCELLED	\N	0	3	4	\N	\N	\N	\N	2025-06-03 06:51:26.778	2025-06-03 06:51:26.778
7	Trafik I┼ş─▒─ş─▒ Ar─▒zal─▒ - Sayg─▒l─▒ Sokak	Trafik ─▒┼ş─▒─ş─▒ s├╝rekli sar─▒ yan─▒p s├Ân├╝yor, kazaya sebebiyet verebilir. Accusamus doloremque quos cum eligendi molestias. Assumenda dolores consectetur consequuntur quidem pariatur voluptatem eius. Repellendus natus nesciunt perferendis dolore maiores corrupti sapiente.	0101000020E61000009FABADD85F063D40D26F5F07CE894440	Maslak, Sar─▒yer, Sar─▒kaya Caddesi 29c	TRAFFIC_LIGHT	TRAFFIC_SERVICES	7	IN_REVIEW	\N	0	1	1	\N	\N	\N	\N	2025-06-03 01:09:31.15	2025-06-03 01:09:31.15
8	Park Ekipmanlar─▒ K─▒r─▒lm─▒┼ş - Nalbant Sokak	Parktaki sal─▒ncak ve kayd─▒raklar k─▒r─▒lm─▒┼ş, ├ğocuklar i├ğin tehlikeli. Ducimus ullam nobis aliquid. Atque minima excepturi nostrum quis sunt. Culpa eius veritatis recusandae quas optio iusto neque quae dignissimos.	0101000020E6100000A01A2FDD24063D40BBB88D06F07E4440	Fenerbah├ğe, Kad─▒k├Ây, Sevgi Sokak 58	PARK_DAMAGE	PARKS_AND_GARDENS	8	CANCELLED	\N	0	2	4	\N	\N	\N	\N	2025-06-03 22:23:46.269	2025-06-03 22:23:46.269
9	Kanalizasyon T─▒kanmas─▒ - Dar Sokak	Kanalizasyon t─▒kanm─▒┼ş, pis su soka─şa ta┼ş─▒yor. Qui veniam corporis cupiditate ipsam animi in nemo tenetur cum. Blanditiis error quo aliquid molestiae quis. Assumenda rem est.	0101000020E6100000B003E78C280D3D407B14AE47E18A4440	Bebek Sahili, Be┼şikta┼ş, Bandak Sokak 624	WATER_LEAKAGE	WATER_AND_SEWERAGE	9	CANCELLED	\N	0	3	2	\N	\N	\N	\N	2025-06-02 11:56:10.995	2025-06-02 11:56:10.995
10	Durak Tabelas─▒ D├╝┼şm├╝┼ş - Harman Alt─▒ Sokak	Otob├╝s dura─ş─▒ tabelas─▒ yerinden ├ğ─▒km─▒┼ş, d├╝┼şme tehlikesi var. Modi iste pariatur eligendi at fugiat a esse ipsum culpa. Delectus quo quos fuga rerum architecto quas aliquam vitae. Facere at error reprehenderit consectetur tenetur enim ducimus omnis enim.	0101000020E610000060E5D022DBF93C4037894160E5804440	─░stiklal Caddesi, Beyo─şlu, Yunus Emre Sokak 88b	PUBLIC_TRANSPORT_STOP	TRAFFIC_SERVICES	10	IN_REVIEW	\N	0	1	4	\N	\N	\N	\N	2025-06-03 23:15:35.017	2025-06-03 23:15:35.017
11	Kald─▒r─▒m Bozulmu┼ş - Sar─▒kaya Caddesi	Kald─▒r─▒mda b├╝y├╝k bir ├ğ├Âkme meydana gelmi┼ş, yayalar─▒n ge├ği┼şi tehlikeli. Pariatur totam fugit. Eveniet veritatis fugiat veritatis repudiandae quasi. Repudiandae minima consectetur aliquam impedit accusantium.	0101000020E61000000A68226C78FA3C40E2E995B20C814440	Taksim Meydan─▒, Beyo─şlu, G├╝l Sokak 6	ROAD_DAMAGE	ROADS_AND_INFRASTRUCTURE	1	DONE	\N	0	1	1	\N	\N	\N	\N	2025-06-03 22:48:20.044	2025-06-03 22:48:20.044
12	Sokak Lambas─▒ Yanm─▒yor - Menek┼şe Sokak	Sokak lambas─▒ ├╝├ğ g├╝nd├╝r yanm─▒yor, ak┼şamlar─▒ sokak tamamen karanl─▒k. Unde fugiat suscipit dicta accusantium accusamus temporibus facilis. Rerum iure eligendi dolores nisi error. Alias provident expedita ab explicabo quaerat.	0101000020E610000024287E8CB9FB3C40DC68006F81844440	┼Şi┼şli Merkez, ─░stanbul, G├╝ven Yaka Sokak 974	STREET_LIGHT	STREET_LIGHTING	2	IN_REVIEW	\N	0	2	3	\N	\N	\N	\N	2025-06-04 08:36:07.368	2025-06-04 08:36:07.368
13	├ç├Âpler Toplanmad─▒ - ─░bn-i Sina Sokak	├£├ğ g├╝nd├╝r ├ğ├Âpler al─▒nmad─▒, k├Ât├╝ koku ve ├ğevre kirlili─şi olu┼şuyor. Nulla illo deleniti soluta. Ad perspiciatis libero iure velit eius animi dicta. Ea ullam repellendus autem ullam.	0101000020E6100000BC0512143F063D409B559FABAD804440	Ba─şdat Caddesi, Kad─▒k├Ây, Okul Sokak 51	GARBAGE_COLLECTION	CLEANING_SERVICES	3	OPEN	\N	0	3	4	\N	\N	\N	\N	2025-06-04 22:37:33.281	2025-06-04 22:37:33.281
14	Su Borusu Patlam─▒┼ş - ├£lk├╝ Sokak	Ana su borusu patlam─▒┼ş durumda, sokak su i├ğinde kald─▒. Maxime delectus aperiam tempora. Sit sunt labore praesentium voluptates animi non illo nemo velit. Odio ex esse error ex repellendus.	0101000020E6100000D7A3703D0A173D408AB0E1E995824440	├£sk├╝dar Merkez, ─░stanbul, Afyon Kaya Sokak 58c	WATER_LEAKAGE	WATER_AND_SEWERAGE	4	DONE	\N	0	1	1	\N	\N	\N	\N	2025-06-02 18:35:28.073	2025-06-02 18:35:28.073
15	Yol ├çukurlarla Dolu - Bah├ğe Sokak	Yolda derin ├ğukurlar olu┼şmu┼ş, ara├ğlar zarar g├Âr├╝yor. Aut labore eum. Nesciunt perspiciatis temporibus. Earum possimus hic magni eum id qui quasi.	0101000020E61000007FD93D7958F83C40287E8CB96B814440	Galata Kulesi, Beyo─şlu, Mevlana Sokak 57	POTHOLE	ROADS_AND_INFRASTRUCTURE	5	IN_PROGRESS	\N	0	2	4	\N	\N	\N	\N	2025-06-04 21:03:32.912	2025-06-04 21:03:32.912
16	A─şa├ğ Devrilme Tehlikesi - O─şuzhan Sokak	F─▒rt─▒nadan dolay─▒ a─şa├ğ yan yatm─▒┼ş, devrilme tehlikesi var. Laudantium quas dolore. Veniam tempore porro quasi alias. Deleniti nulla vitae.	0101000020E610000048BF7D1D38073D4058A835CD3B7E4440	Bostanc─▒ Sahil, Kad─▒k├Ây, Mevlana Sokak 7	TREE_ISSUE	PARKS_AND_GARDENS	6	REJECTED	\N	0	3	4	\N	\N	\N	\N	2025-06-04 04:20:14.527	2025-06-04 04:20:14.527
17	Trafik I┼ş─▒─ş─▒ Ar─▒zal─▒ - 30 A─şustos Caddesi	Trafik ─▒┼ş─▒─ş─▒ s├╝rekli sar─▒ yan─▒p s├Ân├╝yor, kazaya sebebiyet verebilir. Sint et repellat voluptates. Omnis rem temporibus consectetur perspiciatis quas hic quibusdam. Quas veritatis facere repellendus aut nobis rerum est eos dicta.	0101000020E61000009FABADD85F063D40D26F5F07CE894440	Maslak, Sar─▒yer, Dar Sokak 149	TRAFFIC_LIGHT	TRAFFIC_SERVICES	7	CANCELLED	\N	0	1	3	\N	\N	\N	\N	2025-06-02 06:13:10.143	2025-06-02 06:13:10.143
18	Park Ekipmanlar─▒ K─▒r─▒lm─▒┼ş - Sevgi Sokak	Parktaki sal─▒ncak ve kayd─▒raklar k─▒r─▒lm─▒┼ş, ├ğocuklar i├ğin tehlikeli. Laboriosam consequuntur quam commodi labore. Blanditiis eligendi consectetur dolor placeat. Pariatur inventore vitae rem corrupti.	0101000020E6100000A01A2FDD24063D40BBB88D06F07E4440	Fenerbah├ğe, Kad─▒k├Ây, Kerimo─şlu Sokak 49a	PARK_DAMAGE	PARKS_AND_GARDENS	8	IN_REVIEW	\N	0	2	1	\N	\N	\N	\N	2025-06-04 23:11:15.725	2025-06-04 23:11:15.725
19	Kanalizasyon T─▒kanmas─▒ - ─░smet Pa┼şa Caddesi	Kanalizasyon t─▒kanm─▒┼ş, pis su soka─şa ta┼ş─▒yor. Consequatur voluptates natus incidunt molestias. Suscipit qui consectetur aperiam praesentium sit recusandae voluptatem sapiente soluta. Magnam nulla eaque architecto velit a explicabo.	0101000020E6100000B003E78C280D3D407B14AE47E18A4440	Bebek Sahili, Be┼şikta┼ş, Bay─▒r Sokak 11	WATER_LEAKAGE	WATER_AND_SEWERAGE	9	IN_REVIEW	\N	0	3	1	\N	\N	\N	\N	2025-06-02 23:33:37.141	2025-06-02 23:33:37.141
20	Durak Tabelas─▒ D├╝┼şm├╝┼ş - Da─ş─▒n─▒k Evler Sokak	Otob├╝s dura─ş─▒ tabelas─▒ yerinden ├ğ─▒km─▒┼ş, d├╝┼şme tehlikesi var. Ducimus dolores deleniti. Adipisci quod vitae ad excepturi consequatur aliquam ad. Animi modi perferendis.	0101000020E610000060E5D022DBF93C4037894160E5804440	─░stiklal Caddesi, Beyo─şlu, Ergenekon Sokak 451	PUBLIC_TRANSPORT_STOP	TRAFFIC_SERVICES	10	CANCELLED	\N	0	1	1	\N	\N	\N	\N	2025-06-04 05:02:18.799	2025-06-04 05:02:18.799
21	Kald─▒r─▒m Bozulmu┼ş - Ali ├çetinkaya Caddesi	Kald─▒r─▒mda b├╝y├╝k bir ├ğ├Âkme meydana gelmi┼ş, yayalar─▒n ge├ği┼şi tehlikeli. Dolorum pariatur facere ipsum at. Assumenda quia consectetur nesciunt. Deleniti sapiente soluta iste mollitia eligendi tenetur at.	0101000020E61000000A68226C78FA3C40E2E995B20C814440	Taksim Meydan─▒, Beyo─şlu, Alparslan T├╝rke┼ş Bulvar─▒ 683	ROAD_DAMAGE	ROADS_AND_INFRASTRUCTURE	1	OPEN	\N	0	1	1	\N	\N	\N	\N	2025-06-04 05:15:56.089	2025-06-04 05:15:56.089
22	Sokak Lambas─▒ Yanm─▒yor - Bay─▒r Sokak	Sokak lambas─▒ ├╝├ğ g├╝nd├╝r yanm─▒yor, ak┼şamlar─▒ sokak tamamen karanl─▒k. Vel velit amet libero reprehenderit cum reiciendis voluptatum. Quae quae officia cupiditate odit blanditiis aut autem ea. Fugiat voluptatem quod sed possimus ea quae tempora.	0101000020E610000024287E8CB9FB3C40DC68006F81844440	┼Şi┼şli Merkez, ─░stanbul, Ali ├çetinkaya Caddesi 24b	STREET_LIGHT	STREET_LIGHTING	2	OPEN	\N	0	2	1	\N	\N	\N	\N	2025-06-02 22:36:27.876	2025-06-02 22:36:27.876
23	├ç├Âpler Toplanmad─▒ - Nam─▒k Kemal Caddesi	├£├ğ g├╝nd├╝r ├ğ├Âpler al─▒nmad─▒, k├Ât├╝ koku ve ├ğevre kirlili─şi olu┼şuyor. Magni ea voluptatum. Blanditiis ipsa vitae maxime commodi libero qui error quaerat possimus. Nisi culpa occaecati.	0101000020E6100000BC0512143F063D409B559FABAD804440	Ba─şdat Caddesi, Kad─▒k├Ây, L├╝tfi Karadirek Caddesi 58b	GARBAGE_COLLECTION	CLEANING_SERVICES	3	OPEN	\N	0	3	2	\N	\N	\N	\N	2025-06-02 22:58:46.358	2025-06-02 22:58:46.358
24	Su Borusu Patlam─▒┼ş - K├Âyp─▒nar Sokak	Ana su borusu patlam─▒┼ş durumda, sokak su i├ğinde kald─▒. Blanditiis ducimus unde et impedit commodi ut facere. Blanditiis in numquam. Doloremque sit dolore dolorum reprehenderit voluptatum a.	0101000020E6100000D7A3703D0A173D408AB0E1E995824440	├£sk├╝dar Merkez, ─░stanbul, K├Âyp─▒nar Sokak 34a	WATER_LEAKAGE	WATER_AND_SEWERAGE	4	REJECTED	\N	0	1	4	\N	\N	\N	\N	2025-06-05 00:54:04.634	2025-06-05 00:54:04.634
25	Yol ├çukurlarla Dolu - Ali ├çetinkaya Caddesi	Yolda derin ├ğukurlar olu┼şmu┼ş, ara├ğlar zarar g├Âr├╝yor. Distinctio reiciendis facere magnam recusandae unde facere consectetur est amet. Adipisci blanditiis tempora voluptatibus enim voluptates cupiditate tempora enim. Est dicta quo reiciendis.	0101000020E61000007FD93D7958F83C40287E8CB96B814440	Galata Kulesi, Beyo─şlu, Yunus Emre Sokak 87a	POTHOLE	ROADS_AND_INFRASTRUCTURE	5	REJECTED	\N	0	2	4	\N	\N	\N	\N	2025-06-04 10:11:43.088	2025-06-04 10:11:43.088
26	A─şa├ğ Devrilme Tehlikesi - Bar─▒┼ş Sokak	F─▒rt─▒nadan dolay─▒ a─şa├ğ yan yatm─▒┼ş, devrilme tehlikesi var. Eius odit reprehenderit error optio. Eveniet numquam quis ipsa iste quas nihil deleniti. Error suscipit consequuntur cumque atque ducimus.	0101000020E610000048BF7D1D38073D4058A835CD3B7E4440	Bostanc─▒ Sahil, Kad─▒k├Ây, Mevlana Sokak 9	TREE_ISSUE	PARKS_AND_GARDENS	6	IN_REVIEW	\N	0	3	2	\N	\N	\N	\N	2025-06-02 20:02:10.632	2025-06-02 20:02:10.632
27	Trafik I┼ş─▒─ş─▒ Ar─▒zal─▒ - ─░smet Pa┼şa Caddesi	Trafik ─▒┼ş─▒─ş─▒ s├╝rekli sar─▒ yan─▒p s├Ân├╝yor, kazaya sebebiyet verebilir. Fuga voluptatem fuga beatae cumque. Molestias labore fugit dignissimos. Ipsam velit similique sit cupiditate officia distinctio distinctio odio.	0101000020E61000009FABADD85F063D40D26F5F07CE894440	Maslak, Sar─▒yer, Okul Sokak 41	TRAFFIC_LIGHT	TRAFFIC_SERVICES	7	IN_REVIEW	\N	0	1	2	\N	\N	\N	\N	2025-06-03 07:24:37.54	2025-06-03 07:24:37.54
28	Park Ekipmanlar─▒ K─▒r─▒lm─▒┼ş - Sar─▒kaya Caddesi	Parktaki sal─▒ncak ve kayd─▒raklar k─▒r─▒lm─▒┼ş, ├ğocuklar i├ğin tehlikeli. Doloremque cum dignissimos repudiandae pariatur nulla voluptas. Vero dolorum doloremque animi. Adipisci adipisci iusto voluptatem repellendus eos corrupti sunt magnam repellendus.	0101000020E6100000A01A2FDD24063D40BBB88D06F07E4440	Fenerbah├ğe, Kad─▒k├Ây, Bay─▒r Sokak 43	PARK_DAMAGE	PARKS_AND_GARDENS	8	REJECTED	\N	0	2	2	\N	\N	\N	\N	2025-06-03 17:35:41.915	2025-06-03 17:35:41.915
29	Kanalizasyon T─▒kanmas─▒ - Kerimo─şlu Sokak	Kanalizasyon t─▒kanm─▒┼ş, pis su soka─şa ta┼ş─▒yor. Reiciendis qui repellendus nihil ducimus cumque. Natus adipisci quo sint autem quas impedit. Magni quis impedit culpa nobis ab.	0101000020E6100000B003E78C280D3D407B14AE47E18A4440	Bebek Sahili, Be┼şikta┼ş, Sar─▒kaya Caddesi 62c	WATER_LEAKAGE	WATER_AND_SEWERAGE	9	OPEN	\N	0	3	1	\N	\N	\N	\N	2025-06-04 12:16:07.132	2025-06-04 12:16:07.132
31	Kald─▒r─▒m Bozulmu┼ş - Ergenekon Sokak	Kald─▒r─▒mda b├╝y├╝k bir ├ğ├Âkme meydana gelmi┼ş, yayalar─▒n ge├ği┼şi tehlikeli. Quidem accusamus molestias. Provident asperiores dolorum ipsum numquam quos velit exercitationem. Rem harum consequuntur modi soluta veniam beatae facilis.	0101000020E61000000A68226C78FA3C40E2E995B20C814440	Taksim Meydan─▒, Beyo─şlu, Mevlana Sokak 9	ROAD_DAMAGE	ROADS_AND_INFRASTRUCTURE	1	CANCELLED	\N	0	1	1	\N	\N	\N	\N	2025-06-03 13:29:06.376	2025-06-03 13:29:06.376
32	Sokak Lambas─▒ Yanm─▒yor - O─şuzhan Sokak	Sokak lambas─▒ ├╝├ğ g├╝nd├╝r yanm─▒yor, ak┼şamlar─▒ sokak tamamen karanl─▒k. Quisquam occaecati tenetur deserunt temporibus cumque molestias. Quos totam pariatur ullam cupiditate illum assumenda neque porro. Cumque consequuntur ullam dolorem.	0101000020E610000024287E8CB9FB3C40DC68006F81844440	┼Şi┼şli Merkez, ─░stanbul, Afyon Kaya Sokak 783	STREET_LIGHT	STREET_LIGHTING	2	DONE	\N	0	2	2	\N	\N	\N	\N	2025-06-03 06:18:36.862	2025-06-03 06:18:36.862
33	├ç├Âpler Toplanmad─▒ - Nam─▒k Kemal Caddesi	├£├ğ g├╝nd├╝r ├ğ├Âpler al─▒nmad─▒, k├Ât├╝ koku ve ├ğevre kirlili─şi olu┼şuyor. Illo et perspiciatis in. Aliquid quas corporis laudantium exercitationem animi magni reprehenderit. Incidunt maxime commodi illum reiciendis sunt voluptatibus exercitationem.	0101000020E6100000BC0512143F063D409B559FABAD804440	Ba─şdat Caddesi, Kad─▒k├Ây, G├╝l Sokak 66c	GARBAGE_COLLECTION	CLEANING_SERVICES	3	CANCELLED	\N	0	3	3	\N	\N	\N	\N	2025-06-03 08:31:50.718	2025-06-03 08:31:50.718
34	Su Borusu Patlam─▒┼ş - Afyon Kaya Sokak	Ana su borusu patlam─▒┼ş durumda, sokak su i├ğinde kald─▒. Rerum nam in perspiciatis non. Blanditiis non praesentium aliquid a exercitationem ducimus veniam nihil libero. Illum ipsa occaecati sed facilis velit.	0101000020E6100000D7A3703D0A173D408AB0E1E995824440	├£sk├╝dar Merkez, ─░stanbul, ├£lk├╝ Sokak 134	WATER_LEAKAGE	WATER_AND_SEWERAGE	4	OPEN	\N	0	1	3	\N	\N	\N	\N	2025-06-04 14:36:20.317	2025-06-04 14:36:20.317
35	Yol ├çukurlarla Dolu - S─▒ran S├Â─ş├╝t Sokak	Yolda derin ├ğukurlar olu┼şmu┼ş, ara├ğlar zarar g├Âr├╝yor. Nam eligendi nulla cupiditate voluptatibus non esse quis voluptate minus. Et error voluptates non. Recusandae hic est cumque.	0101000020E61000007FD93D7958F83C40287E8CB96B814440	Galata Kulesi, Beyo─şlu, Dar Sokak 74	POTHOLE	ROADS_AND_INFRASTRUCTURE	5	CANCELLED	\N	0	2	1	\N	\N	\N	\N	2025-06-04 00:50:48.157	2025-06-04 00:50:48.157
36	A─şa├ğ Devrilme Tehlikesi - ─░smet Pa┼şa Caddesi	F─▒rt─▒nadan dolay─▒ a─şa├ğ yan yatm─▒┼ş, devrilme tehlikesi var. Sit iure libero. Dignissimos minima nulla laudantium eaque repellat iste saepe. Reprehenderit voluptatem est nam mollitia ipsa dolor.	0101000020E610000048BF7D1D38073D4058A835CD3B7E4440	Bostanc─▒ Sahil, Kad─▒k├Ây, Sayg─▒l─▒ Sokak 92a	TREE_ISSUE	PARKS_AND_GARDENS	6	REJECTED	\N	0	3	3	\N	\N	\N	\N	2025-06-04 01:06:46.961	2025-06-04 01:06:46.961
37	Trafik I┼ş─▒─ş─▒ Ar─▒zal─▒ - Fatih Sokak	Trafik ─▒┼ş─▒─ş─▒ s├╝rekli sar─▒ yan─▒p s├Ân├╝yor, kazaya sebebiyet verebilir. Consequatur quos consectetur incidunt veritatis nesciunt quibusdam ipsum iusto. Sit commodi itaque aperiam ab explicabo sunt quas. Aperiam vitae dolores nihil odit sapiente quibusdam minus.	0101000020E61000009FABADD85F063D40D26F5F07CE894440	Maslak, Sar─▒yer, Ergenekon Sokak 32	TRAFFIC_LIGHT	TRAFFIC_SERVICES	7	DONE	\N	0	1	3	\N	\N	\N	\N	2025-06-02 04:10:07.772	2025-06-02 04:10:07.772
38	Park Ekipmanlar─▒ K─▒r─▒lm─▒┼ş - Dar Sokak	Parktaki sal─▒ncak ve kayd─▒raklar k─▒r─▒lm─▒┼ş, ├ğocuklar i├ğin tehlikeli. Nostrum neque laborum deleniti deleniti corporis odio odit veritatis. Possimus magni animi voluptatem. Ex officiis vel ullam voluptates libero accusantium sunt.	0101000020E6100000A01A2FDD24063D40BBB88D06F07E4440	Fenerbah├ğe, Kad─▒k├Ây, Bay─▒r Sokak 21	PARK_DAMAGE	PARKS_AND_GARDENS	8	IN_PROGRESS	\N	0	2	3	\N	\N	\N	\N	2025-06-04 23:59:18.131	2025-06-04 23:59:18.131
39	Kanalizasyon T─▒kanmas─▒ - Menek┼şe Sokak	Kanalizasyon t─▒kanm─▒┼ş, pis su soka─şa ta┼ş─▒yor. Optio praesentium saepe totam quod. Assumenda omnis quod eius quisquam dolorum similique. Quaerat eius quibusdam ad nobis unde officia nam.	0101000020E6100000B003E78C280D3D407B14AE47E18A4440	Bebek Sahili, Be┼şikta┼ş, G├╝l Sokak 7	WATER_LEAKAGE	WATER_AND_SEWERAGE	9	IN_REVIEW	\N	0	3	4	\N	\N	\N	\N	2025-06-02 22:22:32.257	2025-06-02 22:22:32.257
40	Durak Tabelas─▒ D├╝┼şm├╝┼ş - G├╝ven Yaka Sokak	Otob├╝s dura─ş─▒ tabelas─▒ yerinden ├ğ─▒km─▒┼ş, d├╝┼şme tehlikesi var. Fugiat odit hic nisi pariatur quas voluptatibus sunt. Beatae ducimus et quae cum. Sequi in voluptatum tempora adipisci minima soluta perferendis.	0101000020E610000060E5D022DBF93C4037894160E5804440	─░stiklal Caddesi, Beyo─şlu, Bay─▒r Sokak 14a	PUBLIC_TRANSPORT_STOP	TRAFFIC_SERVICES	10	OPEN	\N	0	1	1	\N	\N	\N	\N	2025-06-05 01:04:14.772	2025-06-05 01:04:14.772
41	Kald─▒r─▒m Bozulmu┼ş - O─şuzhan Sokak	Kald─▒r─▒mda b├╝y├╝k bir ├ğ├Âkme meydana gelmi┼ş, yayalar─▒n ge├ği┼şi tehlikeli. Perspiciatis sunt incidunt sed officiis doloremque sit doloremque ipsum. Quidem possimus facilis beatae fuga delectus consequatur molestias. Numquam nobis molestiae illo vel enim aspernatur laborum.	0101000020E61000000A68226C78FA3C40E2E995B20C814440	Taksim Meydan─▒, Beyo─şlu, Ergenekon Sokak 93	ROAD_DAMAGE	ROADS_AND_INFRASTRUCTURE	1	IN_REVIEW	\N	0	1	3	\N	\N	\N	\N	2025-06-03 13:15:08.706	2025-06-03 13:15:08.706
42	Sokak Lambas─▒ Yanm─▒yor - Sa─şl─▒k Sokak	Sokak lambas─▒ ├╝├ğ g├╝nd├╝r yanm─▒yor, ak┼şamlar─▒ sokak tamamen karanl─▒k. Vero voluptatum porro consequatur. Placeat doloremque pariatur est numquam minima quos. Dolorem pariatur harum ratione occaecati.	0101000020E610000024287E8CB9FB3C40DC68006F81844440	┼Şi┼şli Merkez, ─░stanbul, Atat├╝rk Bulvar─▒ 21	STREET_LIGHT	STREET_LIGHTING	2	IN_PROGRESS	\N	0	2	4	\N	\N	\N	\N	2025-06-05 03:07:55.13	2025-06-05 03:07:55.13
43	├ç├Âpler Toplanmad─▒ - Bay─▒r Sokak	├£├ğ g├╝nd├╝r ├ğ├Âpler al─▒nmad─▒, k├Ât├╝ koku ve ├ğevre kirlili─şi olu┼şuyor. Distinctio voluptatum labore aperiam quisquam non officiis animi. Sed inventore cupiditate nisi corrupti mollitia soluta itaque. Ratione tempora tempora amet exercitationem minus culpa.	0101000020E6100000BC0512143F063D409B559FABAD804440	Ba─şdat Caddesi, Kad─▒k├Ây, Keke├ğo─şlu Sokak 93c	GARBAGE_COLLECTION	CLEANING_SERVICES	3	IN_PROGRESS	\N	0	3	3	\N	\N	\N	\N	2025-06-04 17:14:10.349	2025-06-04 17:14:10.349
44	Su Borusu Patlam─▒┼ş - S─▒ran S├Â─ş├╝t Sokak	Ana su borusu patlam─▒┼ş durumda, sokak su i├ğinde kald─▒. Tempora neque ipsum. Maxime rem quis voluptas vitae tenetur nostrum tempore doloribus molestiae. Reprehenderit quos assumenda impedit deleniti nam ratione velit.	0101000020E6100000D7A3703D0A173D408AB0E1E995824440	├£sk├╝dar Merkez, ─░stanbul, Harman Alt─▒ Sokak 70a	WATER_LEAKAGE	WATER_AND_SEWERAGE	4	IN_REVIEW	\N	0	1	4	\N	\N	\N	\N	2025-06-03 15:03:48.767	2025-06-03 15:03:48.767
45	Yol ├çukurlarla Dolu - Alparslan T├╝rke┼ş Bulvar─▒	Yolda derin ├ğukurlar olu┼şmu┼ş, ara├ğlar zarar g├Âr├╝yor. Quod quasi id. Repellat provident voluptatibus aspernatur quos qui. Blanditiis ipsa totam.	0101000020E61000007FD93D7958F83C40287E8CB96B814440	Galata Kulesi, Beyo─şlu, ─░smet Attila Caddesi 48	POTHOLE	ROADS_AND_INFRASTRUCTURE	5	DONE	\N	0	2	3	\N	\N	\N	\N	2025-06-03 03:54:14.723	2025-06-03 03:54:14.723
46	A─şa├ğ Devrilme Tehlikesi - Sayg─▒l─▒ Sokak	F─▒rt─▒nadan dolay─▒ a─şa├ğ yan yatm─▒┼ş, devrilme tehlikesi var. Pariatur delectus id quaerat voluptatem. Temporibus sit veritatis. Fuga mollitia quidem ut soluta quaerat.	0101000020E610000048BF7D1D38073D4058A835CD3B7E4440	Bostanc─▒ Sahil, Kad─▒k├Ây, G├╝ven Yaka Sokak 57c	TREE_ISSUE	PARKS_AND_GARDENS	6	OPEN	\N	0	3	3	\N	\N	\N	\N	2025-06-03 10:19:53.356	2025-06-03 10:19:53.356
47	Trafik I┼ş─▒─ş─▒ Ar─▒zal─▒ - Tevfik Fikret Caddesi	Trafik ─▒┼ş─▒─ş─▒ s├╝rekli sar─▒ yan─▒p s├Ân├╝yor, kazaya sebebiyet verebilir. Repellat totam voluptatem consequuntur at corrupti odio incidunt dolorem. Beatae ut voluptatibus odio. Occaecati ad iusto officiis.	0101000020E61000009FABADD85F063D40D26F5F07CE894440	Maslak, Sar─▒yer, Kald─▒r─▒m Sokak 39a	TRAFFIC_LIGHT	TRAFFIC_SERVICES	7	CANCELLED	\N	0	1	4	\N	\N	\N	\N	2025-06-03 20:58:01.495	2025-06-03 20:58:01.495
48	Park Ekipmanlar─▒ K─▒r─▒lm─▒┼ş - Sayg─▒l─▒ Sokak	Parktaki sal─▒ncak ve kayd─▒raklar k─▒r─▒lm─▒┼ş, ├ğocuklar i├ğin tehlikeli. Quibusdam explicabo voluptas esse facere doloremque dolores perferendis. Eaque nemo veritatis quidem quis. Reiciendis sint odit vitae quasi.	0101000020E6100000A01A2FDD24063D40BBB88D06F07E4440	Fenerbah├ğe, Kad─▒k├Ây, Dar Sokak 69c	PARK_DAMAGE	PARKS_AND_GARDENS	8	OPEN	\N	0	2	1	\N	\N	\N	\N	2025-06-03 22:48:03.752	2025-06-03 22:48:03.752
49	Kanalizasyon T─▒kanmas─▒ - Fatih Sokak	Kanalizasyon t─▒kanm─▒┼ş, pis su soka─şa ta┼ş─▒yor. Odio repellat corporis sequi. Adipisci ut ipsa occaecati totam adipisci molestiae amet. Mollitia eligendi quidem iusto eum cupiditate.	0101000020E6100000B003E78C280D3D407B14AE47E18A4440	Bebek Sahili, Be┼şikta┼ş, Fatih Sokak 85c	WATER_LEAKAGE	WATER_AND_SEWERAGE	9	IN_PROGRESS	\N	0	3	2	\N	\N	\N	\N	2025-06-02 06:37:31.032	2025-06-02 06:37:31.032
30	Durak Tabelas─▒ D├╝┼şm├╝┼ş - Okul Sokak	Otob├╝s dura─ş─▒ tabelas─▒ yerinden ├ğ─▒km─▒┼ş, d├╝┼şme tehlikesi var. Reiciendis asperiores inventore repudiandae. Commodi quae temporibus voluptas dolorem in odio. Deleniti iusto eaque.	0101000020E610000060E5D022DBF93C4037894160E5804440	─░stiklal Caddesi, Beyo─şlu, Kocatepe Caddesi 41b	PUBLIC_TRANSPORT_STOP	TRAFFIC_SERVICES	10	OPEN	\N	1	1	2	\N	\N	\N	\N	2025-06-03 20:15:24.515	2025-06-05 00:30:19.704189
50	Durak Tabelas─▒ D├╝┼şm├╝┼ş - Kocatepe Caddesi	Otob├╝s dura─ş─▒ tabelas─▒ yerinden ├ğ─▒km─▒┼ş, d├╝┼şme tehlikesi var. Repellat atque laudantium. Enim debitis excepturi accusantium saepe vero placeat nam totam. Placeat tempora voluptas delectus perspiciatis dolorum.	0101000020E610000060E5D022DBF93C4037894160E5804440	─░stiklal Caddesi, Beyo─şlu, S─▒ran S├Â─ş├╝t Sokak 26a	PUBLIC_TRANSPORT_STOP	TRAFFIC_SERVICES	10	IN_REVIEW	\N	2	1	4	\N	\N	\N	\N	2025-06-02 23:59:53.334	2025-06-05 00:37:22.156841
52	├ç├Âp Birikti	├ç├ûPLER ├çOK	0101000020E6100000E83B626EA32C3B40117F2EC9EA314340	180. Sokak, Yaylac─▒k Mahallesi, Buca, ─░zmir, Ege B├Âlgesi, 35400, T├╝rkiye	AIR_POLLUTION	ENVIRONMENTAL_PROTECTION	11	OPEN	\N	1	7	5	\N	\N	\N	\N	2025-06-05 00:58:16.393147	2025-06-05 05:45:49.643793
51	├çUKUR	├çUKUR ├çOK B├£Y├£K	0101000020E610000075A923DDD52C3B4054EBCA55D6324340	┼Şirinkap─▒ Mahallesi, Buca, ─░zmir, Ege B├Âlgesi, 35400, T├╝rkiye	POTHOLE	ROADS_AND_INFRASTRUCTURE	2	OPEN	\N	0	2	5	\N	\N	\N	\N	2025-06-05 00:33:12.964471	2025-06-05 03:15:30.71473
53	asdasda	asdasdasdasd	0101000020E6100000D0339043D12C3B40A761F017D0324340	38.3970, 27.1751	POTHOLE	ROADS_AND_INFRASTRUCTURE	2	OPEN	\N	0	2	6	\N	\N	\N	\N	2025-06-07 23:59:38.157657	2025-06-07 23:59:37.774991
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: specializations; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.specializations (id, code, name, description, typical_department_code, example_source) FROM stdin;
1	ROAD_MAINTENANCE	Yol Bak─▒m	Yol ve kald─▒r─▒m bak─▒m onar─▒m i┼şleri	\N	\N
2	ENVIRONMENTAL_CLEANING	├çevre Temizli─şi	Park ve bah├ğe temizlik i┼şleri	\N	\N
3	INFRASTRUCTURE	Altyap─▒	Su, kanalizasyon ve elektrik altyap─▒ i┼şleri	\N	\N
4	TRAFFIC_MANAGEMENT	Trafik D├╝zenleme	Trafik i┼şaretleri ve d├╝zenleme i┼şleri	\N	\N
5	SOCIAL_SERVICES	Sosyal Hizmetler	Vatanda┼ş hizmetleri ve sosyal destek	\N	\N
\.


--
-- Data for Name: team_membership_history; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.team_membership_history (id, user_id, team_id, joined_at, left_at, role_in_team) FROM stdin;
\.


--
-- Data for Name: team_specializations; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.team_specializations (team_id, specialization_id) FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.teams (id, name, department_id, team_leader_id, status, base_location, current_location, last_location_update) FROM stdin;
1	Test Team	1	\N	AVAILABLE	\N	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.users (id, email, full_name, phone_number, avatar, roles, is_email_verified, password, email_verification_token, password_reset_token, password_reset_expires, department_id, active_team_id, created_at, updated_at, last_login_at) FROM stdin;
4	admin@test.com	Test Admin	\N	\N	{SYSTEM_ADMIN}	t	$2b$10$XK2j7FtAw2Z.25chN23O2ODxL.qfPbe27YBOgRxvrByTfXJOlqhD.	\N	\N	\N	\N	\N	2025-06-05 00:25:55.854584	2025-06-05 00:25:55.943323	\N
1	citizen@test.com	Test Citizen	\N	\N	{CITIZEN}	t	$2b$10$XK2j7FtAw2Z.25chN23O2ODxL.qfPbe27YBOgRxvrByTfXJOlqhD.	\N	\N	\N	\N	\N	2025-06-05 00:25:55.805	2025-06-07 04:54:30.74414	2025-06-07 07:54:30.737
5	furkan.ucann@yandex.com	Furkan U├ğan	\N	\N	{CITIZEN}	f	$2b$10$YJx4n6ZCNamY/kZPJ0hhKOYB.QmaJGmsOKAEJwEMcAQaj9RfDS4/S	\N	\N	\N	\N	\N	2025-06-05 00:29:34.394567	2025-06-05 01:30:57.595397	2025-06-05 04:30:57.569
6	63furkan27@gmail.com	Furkan U├ğan	\N	\N	{CITIZEN}	f	$2b$10$pG3IPzrlJfCYmIb3VfZFwOXBA2AO66owCF.VxhSl5vEFr9ThcLQrm	\N	\N	\N	\N	\N	2025-06-07 05:33:42.906738	2025-06-08 04:13:21.001793	2025-06-08 07:13:21.001
2	team.member@test.com	Test Team Member	\N	\N	{TEAM_MEMBER}	t	$2b$10$XK2j7FtAw2Z.25chN23O2ODxL.qfPbe27YBOgRxvrByTfXJOlqhD.	\N	\N	\N	1	1	2025-06-05 00:25:55.823424	2025-06-08 04:39:39.271722	2025-06-08 07:39:39.261
3	supervisor@test.com	Test Supervisor	\N	\N	{DEPARTMENT_SUPERVISOR}	t	$2b$10$XK2j7FtAw2Z.25chN23O2ODxL.qfPbe27YBOgRxvrByTfXJOlqhD.	\N	\N	\N	1	\N	2025-06-05 00:25:55.838136	2025-06-08 06:25:27.173957	2025-06-08 09:25:27.161
\.


--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: dev
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: dev
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: dev
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: dev
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: dev
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: dev
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.assignments_id_seq', 1, true);


--
-- Name: department_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.department_history_id_seq', 1, false);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.departments_id_seq', 16, true);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.media_id_seq', 5, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- Name: report_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.report_categories_id_seq', 17, true);


--
-- Name: report_medias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.report_medias_id_seq', 109, true);


--
-- Name: report_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.report_status_history_id_seq', 3, true);


--
-- Name: report_supports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.report_supports_id_seq', 7, true);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.reports_id_seq', 53, true);


--
-- Name: specializations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.specializations_id_seq', 5, true);


--
-- Name: team_membership_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.team_membership_history_id_seq', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.teams_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: topology_id_seq; Type: SEQUENCE SET; Schema: topology; Owner: dev
--

SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: assignments PK_assignments_id; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "PK_assignments_id" PRIMARY KEY (id);


--
-- Name: department_history PK_department_history; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.department_history
    ADD CONSTRAINT "PK_department_history" PRIMARY KEY (id);


--
-- Name: departments PK_departments; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "PK_departments" PRIMARY KEY (id);


--
-- Name: media PK_media; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "PK_media" PRIMARY KEY (id);


--
-- Name: report_categories PK_report_categories_id; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_categories
    ADD CONSTRAINT "PK_report_categories_id" PRIMARY KEY (id);


--
-- Name: report_medias PK_report_medias; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_medias
    ADD CONSTRAINT "PK_report_medias" PRIMARY KEY (id);


--
-- Name: report_status_history PK_report_status_history_id; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_status_history
    ADD CONSTRAINT "PK_report_status_history_id" PRIMARY KEY (id);


--
-- Name: reports PK_reports; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "PK_reports" PRIMARY KEY (id);


--
-- Name: specializations PK_specializations_id; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.specializations
    ADD CONSTRAINT "PK_specializations_id" PRIMARY KEY (id);


--
-- Name: team_membership_history PK_team_membership_history_id; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.team_membership_history
    ADD CONSTRAINT "PK_team_membership_history_id" PRIMARY KEY (id);


--
-- Name: team_specializations PK_team_specializations; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.team_specializations
    ADD CONSTRAINT "PK_team_specializations" PRIMARY KEY (team_id, specialization_id);


--
-- Name: teams PK_teams_id; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "PK_teams_id" PRIMARY KEY (id);


--
-- Name: users PK_users_id; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_users_id" PRIMARY KEY (id);


--
-- Name: departments UQ_departments_code; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "UQ_departments_code" UNIQUE (code);


--
-- Name: report_categories UQ_report_categories_code; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_categories
    ADD CONSTRAINT "UQ_report_categories_code" UNIQUE (code);


--
-- Name: report_supports UQ_report_supports_report_user; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_supports
    ADD CONSTRAINT "UQ_report_supports_report_user" UNIQUE (report_id, user_id);


--
-- Name: specializations UQ_specializations_code; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.specializations
    ADD CONSTRAINT "UQ_specializations_code" UNIQUE (code);


--
-- Name: users UQ_users_email; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_users_email" UNIQUE (email);


--
-- Name: report_supports report_supports_pkey; Type: CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_supports
    ADD CONSTRAINT report_supports_pkey PRIMARY KEY (id);


--
-- Name: IDX_department_history_report_id; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_department_history_report_id" ON public.department_history USING btree (report_id);


--
-- Name: IDX_departments_active; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_departments_active" ON public.departments USING btree (is_active);


--
-- Name: IDX_departments_code; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_departments_code" ON public.departments USING btree (code);


--
-- Name: IDX_media_created_at; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_media_created_at" ON public.media USING btree (created_at);


--
-- Name: IDX_media_filename; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_media_filename" ON public.media USING btree (filename);


--
-- Name: IDX_media_mimetype; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_media_mimetype" ON public.media USING btree (mimetype);


--
-- Name: IDX_media_type; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_media_type" ON public.media USING btree (type);


--
-- Name: IDX_report_categories_code; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_report_categories_code" ON public.report_categories USING btree (code);


--
-- Name: IDX_report_categories_department_id; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_report_categories_department_id" ON public.report_categories USING btree (department_id);


--
-- Name: IDX_report_categories_is_active; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_report_categories_is_active" ON public.report_categories USING btree (is_active);


--
-- Name: IDX_report_categories_parent_id; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_report_categories_parent_id" ON public.report_categories USING btree (parent_id);


--
-- Name: IDX_report_medias_report_id; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_report_medias_report_id" ON public.report_medias USING btree (report_id);


--
-- Name: IDX_reports_category_id; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_reports_category_id" ON public.reports USING btree (category_id);


--
-- Name: IDX_reports_current_department_id; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_reports_current_department_id" ON public.reports USING btree (current_department_id);


--
-- Name: IDX_reports_department_code; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_reports_department_code" ON public.reports USING btree (department_code);


--
-- Name: IDX_reports_location; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_reports_location" ON public.reports USING gist (location);


--
-- Name: IDX_reports_report_type; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_reports_report_type" ON public.reports USING btree (report_type);


--
-- Name: IDX_reports_user_id; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_reports_user_id" ON public.reports USING btree (user_id);


--
-- Name: IDX_teams_base_location; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_teams_base_location" ON public.teams USING gist (base_location);


--
-- Name: IDX_teams_current_location; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_teams_current_location" ON public.teams USING gist (current_location);


--
-- Name: IDX_users_email; Type: INDEX; Schema: public; Owner: dev
--

CREATE INDEX "IDX_users_email" ON public.users USING btree (email);


--
-- Name: UQ_report_active_assignment; Type: INDEX; Schema: public; Owner: dev
--

CREATE UNIQUE INDEX "UQ_report_active_assignment" ON public.assignments USING btree (report_id) WHERE (assignment_status = 'ACTIVE'::public.assignment_status_enum);


--
-- Name: assignments FK_assignments_assigned_by_user_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "FK_assignments_assigned_by_user_id" FOREIGN KEY (assigned_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: assignments FK_assignments_assignee_team_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "FK_assignments_assignee_team_id" FOREIGN KEY (assignee_team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: assignments FK_assignments_assignee_user_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "FK_assignments_assignee_user_id" FOREIGN KEY (assignee_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: assignments FK_assignments_report_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "FK_assignments_report_id" FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: department_history FK_department_history_new_dept; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.department_history
    ADD CONSTRAINT "FK_department_history_new_dept" FOREIGN KEY (new_department_id) REFERENCES public.departments(id) ON DELETE RESTRICT;


--
-- Name: department_history FK_department_history_prev_dept; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.department_history
    ADD CONSTRAINT "FK_department_history_prev_dept" FOREIGN KEY (previous_department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: department_history FK_department_history_report; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.department_history
    ADD CONSTRAINT "FK_department_history_report" FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: department_history FK_department_history_user; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.department_history
    ADD CONSTRAINT "FK_department_history_user" FOREIGN KEY (changed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: report_categories FK_report_categories_department; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_categories
    ADD CONSTRAINT "FK_report_categories_department" FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: report_categories FK_report_categories_parent; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_categories
    ADD CONSTRAINT "FK_report_categories_parent" FOREIGN KEY (parent_id) REFERENCES public.report_categories(id) ON DELETE SET NULL;


--
-- Name: report_medias FK_report_medias_report; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_medias
    ADD CONSTRAINT "FK_report_medias_report" FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: report_status_history FK_report_status_history_changed_by_user_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_status_history
    ADD CONSTRAINT "FK_report_status_history_changed_by_user_id" FOREIGN KEY (changed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: report_status_history FK_report_status_history_report_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_status_history
    ADD CONSTRAINT "FK_report_status_history_report_id" FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: reports FK_reports_category; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "FK_reports_category" FOREIGN KEY (category_id) REFERENCES public.report_categories(id) ON DELETE RESTRICT;


--
-- Name: reports FK_reports_closed_by_user; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "FK_reports_closed_by_user" FOREIGN KEY (closed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reports FK_reports_current_department; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "FK_reports_current_department" FOREIGN KEY (current_department_id) REFERENCES public.departments(id) ON DELETE RESTRICT;


--
-- Name: reports FK_reports_user; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "FK_reports_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_membership_history FK_team_membership_history_team_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.team_membership_history
    ADD CONSTRAINT "FK_team_membership_history_team_id" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_membership_history FK_team_membership_history_user_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.team_membership_history
    ADD CONSTRAINT "FK_team_membership_history_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_specializations FK_team_specializations_specialization_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.team_specializations
    ADD CONSTRAINT "FK_team_specializations_specialization_id" FOREIGN KEY (specialization_id) REFERENCES public.specializations(id) ON DELETE CASCADE;


--
-- Name: team_specializations FK_team_specializations_team_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.team_specializations
    ADD CONSTRAINT "FK_team_specializations_team_id" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: teams FK_teams_department_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "FK_teams_department_id" FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE RESTRICT;


--
-- Name: teams FK_teams_team_leader_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "FK_teams_team_leader_id" FOREIGN KEY (team_leader_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: users FK_users_active_team_id; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_users_active_team_id" FOREIGN KEY (active_team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: users FK_users_department; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_users_department" FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: report_supports report_supports_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_supports
    ADD CONSTRAINT report_supports_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: report_supports report_supports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.report_supports
    ADD CONSTRAINT report_supports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

