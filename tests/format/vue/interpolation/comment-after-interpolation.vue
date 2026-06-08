<template>
  <legend>{{ $t('package') }}<!-- #238 --></legend><!-- this gets ugly -->

  <legend>{{ $t('package') }}</legend> <!-- this is ok -->

  <legend>{{ $t('package') }}<!-- comment after interpolation comment after interpolation --></legend>

  <legend><b>inline</b>{{ $t('package') }}<!-- glued comment --></legend>
</template>
