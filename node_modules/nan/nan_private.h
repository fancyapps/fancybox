/*********************************************************************
 * NAN - Native Abstractions for Node.js
 *
 * Copyright (c) 2016 NAN contributors
 *
 * MIT License <https://github.com/nodejs/nan/blob/master/LICENSE.md>
 ********************************************************************/

#ifndef NAN_PRIVATE_H_
#define NAN_PRIVATE_H_

inline Maybe<bool>
HasPrivate(v8::Local<v8::Object> object, v8::Local<v8::String> key) {
  HandleScope scope;
#if NODE_MODULE_VERSION >= NODE_6_0_MODULE_VERSION
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::Local<v8::Context> context = isolate->GetCurrentContext();
  v8::Local<v8::Private> private_key = v8::Private::ForApi(isolate, key);
  return object->HasPrivate(context, private_key);
#else
  return Just(!object->GetHiddenValue(key).IsEmpty());
#endif
}

inline MaybeLocal<v8::Value>
GetPrivate(v8::Local<v8::Object> object, v8::Local<v8::String> key) {
  HandleScope scope;
#if NODE_MODULE_VERSION >= NODE_6_0_MODULE_VERSION
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::Local<v8::Context> context = isolate->GetCurrentContext();
  v8::Local<v8::Private> private_key = v8::Private::ForApi(isolate, key);
  return object->GetPrivate(context, private_key);
#else
  v8::Local<v8::Value> v = object->GetHiddenValue(key);
  v8::Local<v8::Value> def = Undefined();
  return MaybeLocal<v8::Value>(v.IsEmpty() ? def : v);
#endif
}

inline Maybe<bool> SetPrivate(
    v8::Local<v8::Object> object,
    v8::Local<v8::String> key,
    v8::Local<v8::Value> value) {
#if NODE_MODULE_VERSION >= NODE_6_0_MODULE_VERSION
  HandleScope scope;
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::Local<v8::Context> context = isolate->GetCurrentContext();
  v8::Local<v8::Private> private_key = v8::Private::ForApi(isolate, key);
  return object->SetPrivate(context, private_key, value);
#else
  return Just(object->SetHiddenValue(key, value));
#endif
}

inline Maybe<bool> DeletePrivate(
    v8::Local<v8::Object> object,
    v8::Local<v8::String> key) {
#if NODE_MODULE_VERSION >= NODE_6_0_MODULE_VERSION
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::Local<v8::Private> private_key = v8::Private::ForApi(isolate, key);
  return object->DeletePrivate(isolate->GetCurrentContext(), private_key);
#else
  return Just(object->DeleteHiddenValue(key));
#endif
}

#endif  // NAN_PRIVATE_H_

