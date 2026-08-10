UPDATE "store_config"
SET "payment_methods" = '[
  {"id":"pix","label":"Pix","active":false,"order":0,"instruction":"","pixKey":""},
  {"id":"cash","label":"Dinheiro","active":false,"order":1,"instruction":"","pixKey":""},
  {"id":"debit","label":"Débito","active":false,"order":2,"instruction":"","pixKey":""},
  {"id":"credit","label":"Crédito","active":false,"order":3,"instruction":"","pixKey":""}
]'::jsonb
WHERE "id" = 'default'
  AND jsonb_typeof("payment_methods") = 'array'
  AND NOT ("payment_methods" @> '[{"active": false}]'::jsonb OR "payment_methods" @> '[{"active": true}]'::jsonb);
