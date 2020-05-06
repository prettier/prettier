// @flow

declare class Seq<K, +V> {
  static Keyed: typeof KeyedSeq;
}
declare class KeyedSeq<K, +V> extends Seq<K, V> {
  key: K;
}
declare var a: Seq.Keyed<number, number>
