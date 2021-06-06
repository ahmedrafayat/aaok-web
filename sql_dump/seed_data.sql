-------------------     FORMS DATA      -------------------
INSERT INTO public.forms (form_id, title, description, management_only)
VALUES (1, 'Near Hit', 'I have witnessed a Near Hit situation', false),
       (2, 'Share a Problem', 'I need help. I have a problem', false),
       (3, 'Share an Idea', 'I have a great idea', false),
       (4, 'Share a Concern', 'I am worried about someone else', false),
       (5, 'Give Kudos', 'I want to give kudos to someone', false),
       (6, 'Behavioural Safety', 'Behavioural Safety Visit', true);
-------------------     FORMS DATA      -------------------


-------------------     FIELDS DATA      -------------------
INSERT INTO public.fields (field_id, form_id, field_key, "label", field_type, json_config, sort_order, management_only)
VALUES (1, 1, 'autoGpsStamp', NULL, 2, NULL, 0, false),
       (2, 1, 'autoDateTime', NULL, 3, NULL, 1, false),
       (3, 1, 'nameOrAnonymous', 'Name', 6, NULL, 2, false),
       (4, 1, 'incident', 'Incident', 7, NULL, 3, false),
       (5, 1, 'addPhoto', NULL, 8, NULL, 4, false);
INSERT INTO public.fields (field_id, form_id, field_key, "label", field_type, json_config, sort_order, management_only)
VALUES (6, 2, 'autoDateTime', NULL, 3, NULL, 0, false),
       (7, 2, 'myProblem', 'My Problem', 7, NULL, 2, false),
       (8, 2, 'addPhoto', NULL, 8, NULL, 3, false),
       (9, 2, 'nameOrAnonymous', 'Name', 6, NULL, 4, false);
INSERT INTO public.fields (field_id, form_id, field_key, "label", field_type, json_config, sort_order, management_only)
VALUES (10, 3, 'autoDateTime', NULL, 3, NULL, 0, false),
       (11, 3, 'myIdea', 'My Idea', 7, NULL, 2, false),
       (12, 3, 'whyItWouldHelp', 'Why I think it would help', 7, NULL, 3, false),
       (13, 3, 'addPhoto', NULL, 8, NULL, 4, false),
       (14, 3, 'nameOrAnonymous', 'Name', 6, NULL, 5, false);
INSERT INTO public.fields (field_id, form_id, field_key, "label", field_type, json_config, sort_order, management_only)
VALUES (15, 4, 'autoDateTime', NULL, 3, NULL, 0, false),
       (16, 4, 'theirName', 'Their name', 0, NULL, 2, false),
       (17, 4, 'nameOrAnonymous', 'Name', 6, NULL, 1, false),
       (18, 4, 'whatTheProblemIs', 'What the problem is', 7, NULL, 3, false),
       (19, 4, 'addPhoto', NULL, 8, NULL, 4, false);
INSERT INTO public.fields (field_id, form_id, field_key, "label", field_type, json_config, sort_order, management_only)
VALUES (20, 5, 'autoDateTime', NULL, 3, NULL, 0, false),
       (21, 5, 'nameOrAnonymous', 'Name', 6, NULL, 1, false),
       (22, 5, 'theirName', 'Their name', 0, NULL, 2, false),
       (23, 5, 'whatTheKudosFor', 'What the kudos is for', 7, NULL, 3, false),
       (24, 5, 'addPhoto', NULL, 8, NULL, 4, false);
INSERT INTO public.fields (field_id, form_id, field_key, "label", field_type, json_config, sort_order, management_only)
VALUES (25, 6, 'autoGpsStamp', NULL, 2, NULL, 0, false),
       (26, 6, 'autoDateTime', NULL, 3, NULL, 1, false),
       (27, 6, 'supervisor', 'Supervisor/Project Manager', 0, NULL, 2, false),
       (28, 6, 'contractName', 'Contract Name', 0, NULL, 3, false),
       (29, 6, 'descriptionOfWorks', 'Description of Works', 7, NULL, 4, false),
       (30, 6, 'commentObservations', 'Observations made', 7, NULL, 5, false),
       (31, 6, 'commentImprove', 'Identified areas for improvement', 7, NULL, 6, false),
       (32, 6, 'commentActions', 'Actions agreed', 7, NULL, 7, false),
       (33, 6, 'commentIssues', 'Other issues discussed', 7, NULL, 8, false),
       (34, 6, 'signature', NULL, 10, NULL, 9, false);
-------------------     FIELDS DATA      -------------------

